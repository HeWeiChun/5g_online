package decoder

import (
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/Freddy/sctp_flowmap/decoder/NGAP"
	"github.com/Freddy/sctp_flowmap/flowMap"
	"github.com/free5gc/ngap"
	"github.com/free5gc/ngap/ngapType"
	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
	"time"
)

func Decode(interfaceName string, task string, mode string, aggregate string) {
	//fmt.Println("===============This project is for decoding the pcap file of NGAP and getting the info of some necessary bytes.===============")
	//fmt.Println("===============Created by Galadriel on 6/26/2022===============")
	// 启动监听
	if aggregate == "UE" {
		go flowMap.UEFlowMapToStore()
	} else {
		go flowMap.TimeFlowMapToStore()
	}
	// 初始化信号处理
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGUSR1, syscall.SIGUSR2)
	var handle *pcap.Handle
	var err error
	// 在线检测(1), 离线检测(0)
	if mode == "1" {
		handle, err = pcap.OpenLive(interfaceName, 1600, true, pcap.BlockForever)
		if err != nil {
			fmt.Printf("打开在线端口时出错：%v\n", err)
			close(flowMap.StopFlowMapToStore)
			<-flowMap.AllStop
			os.Exit(200)
		}
	} else if mode == "0" {
		handle, err = pcap.OpenOffline(interfaceName)
		if err != nil {
			fmt.Printf("打开离线文件时出错：%v\n", err)
			os.Exit(200)
		}
	} else {
		fmt.Println("模式选择错误")
		os.Exit(200)
	}
	defer handle.Close()

	TimeFirst := int64(0)
	fmt.Println(&handle, handle)
	packetSource := gopacket.NewPacketSource(
		handle,
		handle.LinkType(),
	)

	num := 0
	for {
		select {
		case packet, ok := <-packetSource.Packets():
			// 文件处理完毕后，输出"离线文件处理完毕"
			if !ok {
				fmt.Println("离线文件处理完毕")
				close(flowMap.StopFlowMapToStore)
				<-flowMap.AllStop
				return
			}
			applicationLayer := packet.ApplicationLayer()

			if applicationLayer != nil {
				payload := applicationLayer.Payload()
				ATU := time.Now().UnixNano()
				AT := time.Now()
				if mode == "0" {
					ATU = packet.Metadata().Timestamp.UnixNano()
					AT = packet.Metadata().Timestamp
				}
				Packet_UE := &flowMap.Packet{
					NgapPayloadBytes:    payload,
					ArriveTimeUs:        ATU,
					ArriveTime:          AT,
					RAN_UE_NGAP_ID:      -1,
					PayloadBytes:        packet.Data(),
					PacketLen:           uint32(len(packet.Data())),
					TimeID:              "0",
					InitiatingMessage:   0,
					SuccessfulOutcome:   0,
					UnsuccessfulOutcome: 0,
				}
				if packet.Layer(layers.LayerTypeSCTP) == nil {
					continue
				}
				var DecResult *ngapType.NGAPPDU
				DecResult, err = ngap.Decoder(payload)
				if err == nil {
					num = num + 1

					if num == 1 {
						TimeFirst = Packet_UE.ArriveTimeUs
					}

					NGAP.RouteNGAP(DecResult, Packet_UE)
					sctpLayer := packet.Layer(layers.LayerTypeSCTP)
					if sctpLayer != nil {
						if sctp, ok := sctpLayer.(*layers.SCTP); ok {
							Packet_UE.VerificationTag = sctp.VerificationTag
						}
					}
					ip4Layer := packet.Layer(layers.LayerTypeIPv4)
					ip6Layer := packet.Layer(layers.LayerTypeIPv6)
					if ip4Layer != nil {
						if ipv4, ok := ip4Layer.(*layers.IPv4); ok {
							Packet_UE.DstIP = ipv4.DstIP.String()
							Packet_UE.SrcIP = ipv4.SrcIP.String()
						}
					}
					if ip6Layer != nil {
						if ipv6, ok := ip6Layer.(*layers.IPv6); ok {
							Packet_UE.DstIP = ipv6.DstIP.String()
							Packet_UE.SrcIP = ipv6.SrcIP.String()
						}
					}

					if Packet_UE.RAN_UE_NGAP_ID != -1 {
						flowUEID := flowMap.Count_UE_ID(Packet_UE, TimeFirst, task)
						flowTimeID := flowMap.Count_Time_ID(Packet_UE, TimeFirst, task)

						strFlowUEID := strconv.FormatUint(flowUEID, 10)
						strFlowTimeID := strconv.FormatUint(flowTimeID, 10)
						Packet_UE.FlowID = strFlowUEID
						Packet_UE.TimeID = strFlowTimeID
						flowMap.Put(Packet_UE, flowMap.FlowMap_Time, strFlowTimeID, strFlowUEID, task, aggregate)
						// 输出Packet_UE
						//fmt.Println(Packet_UE.ArriveTimeUs, Packet_UE.ArriveTime, Packet_UE.RAN_UE_NGAP_ID,
						//	Packet_UE.NgapType, Packet_UE.NgapProcedureCode, Packet_UE.VerificationTag,
						//	Packet_UE.DstIP, Packet_UE.SrcIP, Packet_UE.PacketLen)
					}
				}
			}
		// 接收到退出信号后，输出"接收到退出信号"
		case sig := <-c:
			fmt.Printf("收到退出信号：%v\n", sig)
			close(flowMap.StopFlowMapToStore)
			<-flowMap.AllStop
			os.Exit(0)
		}
	}
}

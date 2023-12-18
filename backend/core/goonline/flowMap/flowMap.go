package flowMap

import (
	"container/list"
	"strconv"
	"sync"
	"time"

	"github.com/Freddy/sctp_flowmap/database/PacketDB"
	"github.com/Freddy/sctp_flowmap/database/TimeFlow"
	"github.com/Freddy/sctp_flowmap/database/UEFlow"
)

var (
	FlowMap_Time       *sync.Map
	StopFlowMapToStore chan struct{}
	AllStop            chan struct{}
	flowCount_UE       uint64 = 0
	flowCount_Time     uint64 = 0

	TimeMax     int64 = 300000000
	min_intervl int64 = 1
	TimeChip    int64 = 5000000000

	nowTimeFlowID    = "-1"
	changeFlowIDTime = time.Now()
)

func init() {
	FlowMap_Time = new(sync.Map)
	StopFlowMapToStore = make(chan struct{})
	AllStop = make(chan struct{})
}

func Count_UE_ID(packet *Packet, TimeFirst int64, taskid string) uint64 {
	RAN_UE_NGAP_ID := packet.RAN_UE_NGAP_ID
	Time := packet.ArriveTimeUs - TimeFirst
	Time = Time / TimeChip
	flowID := FastThreeHash([]byte(strconv.FormatInt(RAN_UE_NGAP_ID, 10)), []byte(strconv.FormatInt(Time, 10)), []byte(taskid))
	return flowID
}

func Count_Time_ID(packet *Packet, TimeFirst int64, taskid string) uint64 {
	Time := packet.ArriveTimeUs - TimeFirst
	Time = Time / TimeChip
	return FastTwoHash([]byte(strconv.FormatInt(Time, 10)), []byte(taskid))
}

func Put(packet *Packet, flowMap *sync.Map, flowTimeID string, flowUEID string, taskid string, flowType string) {
	nowTimeFlowID = flowTimeID
	changeFlowIDTime = time.Now()
	// 先找timeflow
	flow, timeflow, isTimeExist := loadTimeFlow(flowTimeID, flowMap)
	if !isTimeExist {
		if flowType == "UE" {
			// 首次接收，创建流info
			timeflow = &FlowInfo{
				FlowID: flowTimeID,
			}
			flow = storeTimeFlow(flowTimeID, timeflow, flowMap)
			ueflow := &FlowInfo{
				FlowID:          flowUEID,
				RAN_UE_NGAP_ID:  packet.RAN_UE_NGAP_ID,
				FlowType:        NGAPType,
				TotalNum:        1,
				VerificationTag: packet.VerificationTag,
				SrcIP:           packet.SrcIP,
				DstIP:           packet.DstIP,
				TimeID:          packet.TimeID,
				BeginTime:       packet.ArriveTime,
				TaskID:          taskid,
			}
			packet.DirSeq = 1
			packet.TimeInterval = uint64(min_intervl)
			ueflow.EndTime = packet.ArriveTime
			ueflow.EndTimeUs = packet.ArriveTimeUs
			ueflow.PacketList = list.List{}
			ueflow.PacketList.PushBack(packet)
			flow.ueflowlist[flowUEID] = ueflow
			flowCount_UE++
		}
		if flowType == "Time" {
			// 首次接收，创建流info
			timeflow = &FlowInfo{
				FlowID:          flowTimeID,
				RAN_UE_NGAP_ID:  packet.RAN_UE_NGAP_ID,
				FlowType:        NGAPType,
				TotalNum:        1,
				VerificationTag: packet.VerificationTag,
				SrcIP:           packet.SrcIP,
				DstIP:           packet.DstIP,
				TimeID:          packet.TimeID,
				BeginTime:       packet.ArriveTime,
				TaskID:          taskid,
			}
			packet.DirSeq = 1
			packet.TimeInterval = uint64(min_intervl)
			timeflow.EndTime = packet.ArriveTime
			timeflow.EndTimeUs = packet.ArriveTimeUs
			timeflow.PacketList = list.List{}
			timeflow.PacketList.PushBack(packet)
			flow = storeTimeFlow(flowTimeID, timeflow, flowMap)
			flowCount_Time++
		}
	} else {
		if flowType == "Time" {
			packet.TimeInterval = uint64(packet.ArriveTimeUs - timeflow.EndTimeUs + min_intervl)
			timeflow.EndTime = packet.ArriveTime
			timeflow.EndTimeUs = packet.ArriveTimeUs
			timeflow.PacketList.PushBack(packet)
			timeflow.TotalNum = timeflow.TotalNum + 1
		}
		if flowType == "UE" {
			ueflowlist := flow.ueflowlist
			ueflow, isUEExist := ueflowlist[flowUEID]
			if isUEExist {
				packet.TimeInterval = uint64(packet.ArriveTimeUs - ueflow.EndTimeUs + min_intervl)
				ueflow.EndTime = packet.ArriveTime
				ueflow.EndTimeUs = packet.ArriveTimeUs
				ueflow.PacketList.PushBack(packet)
				ueflow.TotalNum = ueflow.TotalNum + 1
			} else {
				// 首次接收，创建流info
				ueflow = &FlowInfo{
					FlowID:          flowUEID,
					RAN_UE_NGAP_ID:  packet.RAN_UE_NGAP_ID,
					FlowType:        NGAPType,
					TotalNum:        1,
					VerificationTag: packet.VerificationTag,
					SrcIP:           packet.SrcIP,
					DstIP:           packet.DstIP,
					TimeID:          packet.TimeID,
					BeginTime:       packet.ArriveTime,
					TaskID:          taskid,
				}
				packet.DirSeq = 1
				packet.TimeInterval = uint64(min_intervl)
				ueflow.EndTime = packet.ArriveTime
				ueflow.EndTimeUs = packet.ArriveTimeUs
				ueflow.PacketList = list.List{}
				ueflow.PacketList.PushBack(packet)
				ueflowlist[flowUEID] = ueflow
				flowCount_UE++
			}
		}
	}
}

func UEFlowMapToStore() {
	for {
		select {
		case <-StopFlowMapToStore:
			var rubbishList = list.New()
			FlowMap_Time.Range(func(key, value interface{}) bool {
				flow := value.(*Flow)
				ueflowlist := flow.ueflowlist
				for _, ueflow := range ueflowlist {
					//fmt.Println("flowId: ", flowUEID, ",  time: ", ueflow.EndTimeUs)
					rubbishList.PushBack(ueflow)
					flowCount_UE--
				}
				deleteFlow(flow.timeflow.FlowID, FlowMap_Time)
				return true
			})
			if rubbishList.Len() > 0 {
				UEflowStore(rubbishList)
			}
			AllStop <- struct{}{}
			return
		default:
			var rubbishList = list.New()
			FlowMap_Time.Range(func(key, value interface{}) bool {
				flow := value.(*Flow)
				if !((flow.timeflow.FlowID == nowTimeFlowID && time.Now().Sub(changeFlowIDTime) < 6*time.Second) || nowTimeFlowID == "-1") {
					ueflowlist := flow.ueflowlist
					for _, ueflow := range ueflowlist {
						//fmt.Println("flowId: ", flowUEID, ",  time: ", ueflow.EndTimeUs)
						rubbishList.PushBack(ueflow)
						flowCount_UE--
					}
					deleteFlow(flow.timeflow.FlowID, FlowMap_Time)
				}
				return true
			})
			if rubbishList.Len() > 0 {
				UEflowStore(rubbishList)
			}
		}
	}
}

func UEflowStore(rubbishList *list.List) {
	var UeFlowList = list.New()
	var PacketList = list.New()
	for info := rubbishList.Front(); info != nil; info = info.Next() {
		flowInfo := info.Value.(*FlowInfo)
		fl := &UEFlow.UeFlow{
			FlowId:          flowInfo.FlowID,
			RanUeNgapId:     flowInfo.RAN_UE_NGAP_ID,
			TotalNum:        uint32(flowInfo.TotalNum),
			BeginTime:       flowInfo.BeginTime,
			LatestTime:      flowInfo.EndTime,
			VerificationTag: uint64(flowInfo.VerificationTag),
			SrcIP:           flowInfo.SrcIP,
			DstIP:           flowInfo.DstIP,
			//TimeID          uint64
			StatusFlow: 0,
			TaskID:     flowInfo.TaskID,
		}
		UeFlowList.PushBack(fl)
		for cur := flowInfo.PacketList.Front(); cur != nil; cur = cur.Next() {
			parse := cur.Value.(*Packet)
			packet := &PacketDB.Packet{
				//PacketId: FnvHash([]byte(string(parse.ArriveTimeUs))),
				NgapType:            parse.NgapType,
				NgapProcedureCode:   parse.NgapProcedureCode,
				RanUeNgapId:         parse.RAN_UE_NGAP_ID,
				PacketLen:           parse.PacketLen,
				ArriveTimeUs:        parse.ArriveTimeUs,
				ArriveTime:          parse.ArriveTime,
				TimeInterval:        parse.TimeInterval,
				VerificationTag:     uint64(parse.VerificationTag),
				SrcIP:               parse.SrcIP,
				DstIP:               parse.DstIP,
				DirSeq:              parse.DirSeq,
				FlowUEID:            parse.FlowID,
				FlowTimeID:          parse.TimeID,
				InitiatingMessage:   parse.InitiatingMessage,
				SuccessfulOutcome:   parse.SuccessfulOutcome,
				UnsuccessfulOutcome: parse.UnsuccessfulOutcome,
				StatusPacket:        0,
			}
			PacketList.PushBack(packet)
		}
	}
	PacketDB.InsertPacket(PacketList)
	UEFlow.InsertUeFlow(UeFlowList)
}

func TimeFlowMapToStore() {
	for {
		select {
		case <-StopFlowMapToStore:
			var rubbishList = list.New()
			FlowMap_Time.Range(func(key, value interface{}) bool {
				flow := value.(*Flow)
				nowTime := time.Now().UnixNano()
				timeflow := flow.timeflow
				if nowTime-timeflow.EndTimeUs < 5e9 {
					//fmt.Println("flowId: ", timeflow.FlowID, ",  time: ", timeflow.EndTimeUs)
					rubbishList.PushBack(timeflow)
					deleteFlow(timeflow.FlowID, FlowMap_Time)
					flowCount_Time--
				}
				return true
			})
			if rubbishList.Len() > 0 {
				TimeflowStore(rubbishList)
			}
			AllStop <- struct{}{}
			return
		default:
			var rubbishList = list.New()
			FlowMap_Time.Range(func(key, value interface{}) bool {
				flow := value.(*Flow)
				if !(flow.timeflow.FlowID == nowTimeFlowID && time.Now().Sub(changeFlowIDTime) < 6*time.Second) {
					timeflow := flow.timeflow
					//fmt.Println("flowId: ", timeflow.FlowID, ",  time: ", timeflow.EndTimeUs)
					rubbishList.PushBack(timeflow)
					deleteFlow(timeflow.FlowID, FlowMap_Time)
					flowCount_Time--
				}
				return true
			})
			if rubbishList.Len() > 0 {
				TimeflowStore(rubbishList)
			}
		}
	}
}

func TimeflowStore(rubbishList *list.List) {
	var TimeFlowList = list.New()
	var PacketList = list.New()
	for info := rubbishList.Front(); info != nil; info = info.Next() {
		flowInfo := info.Value.(*FlowInfo)
		fl := &TimeFlow.TimeFlow{
			FlowId:          flowInfo.FlowID,
			RanUeNgapId:     flowInfo.RAN_UE_NGAP_ID,
			TotalNum:        uint32(flowInfo.TotalNum),
			BeginTime:       flowInfo.BeginTime,
			LatestTime:      flowInfo.EndTime,
			VerificationTag: uint64(flowInfo.VerificationTag),
			SrcIP:           flowInfo.SrcIP,
			DstIP:           flowInfo.DstIP,
			//TimeID          uint64
			StatusFlow: 0,
			TaskID:     flowInfo.TaskID,
		}
		TimeFlowList.PushBack(fl)

		for cur := flowInfo.PacketList.Front(); cur != nil; cur = cur.Next() {
			parse := cur.Value.(*Packet)
			packet := &PacketDB.Packet{
				//PacketId: FnvHash([]byte(string(parse.ArriveTimeUs))),
				NgapType:            parse.NgapType,
				NgapProcedureCode:   parse.NgapProcedureCode,
				RanUeNgapId:         parse.RAN_UE_NGAP_ID,
				PacketLen:           parse.PacketLen,
				ArriveTimeUs:        parse.ArriveTimeUs,
				ArriveTime:          parse.ArriveTime,
				TimeInterval:        parse.TimeInterval,
				VerificationTag:     uint64(parse.VerificationTag),
				SrcIP:               parse.SrcIP,
				DstIP:               parse.DstIP,
				DirSeq:              parse.DirSeq,
				FlowUEID:            parse.FlowID,
				FlowTimeID:          parse.TimeID,
				InitiatingMessage:   parse.InitiatingMessage,
				SuccessfulOutcome:   parse.SuccessfulOutcome,
				UnsuccessfulOutcome: parse.UnsuccessfulOutcome,
				StatusPacket:        0,
			}
			PacketList.PushBack(packet)
		}
	}
	PacketDB.InsertPacket(PacketList)
	TimeFlow.InsertTimeFlow(TimeFlowList)
}

package main

import (
	"flag"
	"fmt"
	"time"
	"github.com/Freddy/sctp_flowmap/database"
	"github.com/Freddy/sctp_flowmap/decoder"
	"github.com/Freddy/sctp_flowmap/flowMap"
)

func main() {
	pcapPath := flag.String("pcap_path", "", "Path to the pcap file")
	taskID := flag.String("taskid", "", "The task ID")

	flag.Parse()
	_, err := database.Connect.Begin()
	database.CheckErr(err)

	if *pcapPath == "" {
		fmt.Println("pcap_path参数未提供")
		return
	}
	if *taskID == "" {
		fmt.Println("pcap_path参数未提供")
		return
	}

	start := time.Now()
	decoder.Decode(*pcapPath, *taskID)
    elapsed := time.Since(start)
    fmt.Println("解析pcap文件用时: ", elapsed)

	fmt.Println("等待存储到数据库")
	start = time.Now()
	flowMap.UEFlowMapToStore()
	flowMap.TimeFlowMapToStore(*taskID)
	elapsed = time.Since(start)
    fmt.Println("存储到数据库用时: ", elapsed)
}

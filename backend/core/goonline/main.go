package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/Freddy/sctp_flowmap/database"
	"github.com/Freddy/sctp_flowmap/decoder"
)

func main() {
	pcapPath := flag.String("pcap_path", "", "Path to the pcap file")
	taskID := flag.String("taskid", "", "The task ID")
	mode := flag.String("mode", "", "The detect mode") // 在线检测(1), 离线检测(0)
	aggregate := flag.String("aggregate", "", "The aggregation method")
	flag.Parse()
	_, err := database.Connect.Begin()
	database.CheckErr(err)
	if *pcapPath == "" {
		fmt.Println("pcap_path参数未提供")
		os.Exit(200)
	}
	if *taskID == "" {
		fmt.Println("pcap_path参数未提供")
		os.Exit(200)
	}
	if *mode == "" {
		fmt.Println("mode参数未提供")
		os.Exit(200)
	}
	if *aggregate == "" {
		fmt.Println("aggregate参数未提供")
		os.Exit(200)
	}
	decoder.Decode(*pcapPath, *taskID, *mode, *aggregate)
}

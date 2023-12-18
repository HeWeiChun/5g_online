package flowMap

import (
	"container/list"
	"sync"
	"time"
)

type PacketType string

var (
	TABLE_SIZE        uint64 = 10240000
	PACKET_TABLE_SIZE uint   = 20000
)

const (
	NGAPType PacketType = "NGAP"
)

type Flow struct {
	timeflow   *FlowInfo
	ueflowlist map[string]*FlowInfo
	next       *Flow
}

type FlowInfo struct {
	RAN_UE_NGAP_ID  int64
	FlowID          string
	FlowType        PacketType
	TotalNum        uint
	PacketList      list.List
	BeginTime       time.Time
	EndTime         time.Time
	EndTimeUs       int64
	VerificationTag uint32
	SrcIP           string
	DstIP           string
	TimeID          string
	TaskID          string
}

type Packet struct {
	NgapType            string
	NgapProcedureCode   string
	NgapRoute           string
	RAN_UE_NGAP_ID      int64
	AMF_UE_NGAP_ID      int64
	ArriveTimeUs        int64
	ArriveTime          time.Time
	PacketLen           uint32
	TimeInterval        uint64
	NgapPayloadBytes    []byte
	PayloadBytes        []byte
	VerificationTag     uint32
	SrcIP               string
	DstIP               string
	FlowID              string
	TimeID              string
	DirSeq              int8
	InitiatingMessage   uint8
	SuccessfulOutcome   uint8
	UnsuccessfulOutcome uint8
}

func loadTimeFlow(flowTimeId string, flowMap *sync.Map) (*Flow, *FlowInfo, bool) {
	value, ok := flowMap.Load(flowTimeId)
	if !ok {
		return nil, nil, false
	}
	return value.(*Flow), value.(*Flow).timeflow, true
}

func storeTimeFlow(flowId string, flowInfo *FlowInfo, flowMap *sync.Map) *Flow {
	flowMap.Store(flowId, &Flow{timeflow: flowInfo, ueflowlist: make(map[string]*FlowInfo), next: nil})
	value, _ := flowMap.Load(flowId)
	return value.(*Flow)
}

func deleteFlow(flowTimeId string, flowMap *sync.Map) bool {
	flowMap.Delete(flowTimeId)
	return true
}

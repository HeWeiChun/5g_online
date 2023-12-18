package PacketDB

import (
	"fmt"
	"time"
)

type Packet struct {
	//PacketId          uint64 //包哈希id
	NgapType            string
	NgapProcedureCode   string
	RanUeNgapId         int64
	PacketLen           uint32
	ArriveTimeUs        int64
	ArriveTime          time.Time
	TimeInterval        uint64
	VerificationTag     uint64
	SrcIP               string
	DstIP               string
	DirSeq              int8
	FlowUEID            string
	FlowTimeID          string
	InitiatingMessage   uint8
	SuccessfulOutcome   uint8
	UnsuccessfulOutcome uint8
	StatusPacket        uint16
}

var PacketTable = "sctp_test.packet"

var insertPacketSQL = `
		INSERT INTO ` + PacketTable +
	`
		(ngap_type, ngap_procedure_code, ran_ue_ngap_id, packet_len, 
		arrive_time_us, arrive_time, time_interval, verification_tag,
		src_ip, dst_ip, dir_seq, flow_ue_id, flow_time_id, 
		initiating_message, successful_outcome, unsuccessful_outcome, status_packet) 
		values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

var queryPacketSQL = `
		SELECT NgapType, NgapProcedureCode, RanUeNgapId, PacketLen, 
		ArriveTimeUs, ArriveTime, TimeInterval, VerificationTag, 
		SrcIP, DstIP, DirSeq, FlowUEID, FlowTimeID, 
		InitiatingMessage, SuccessfulOutcome, UnsuccessfulOutcome, StatusPacket 
		FROM ` + PacketTable

var creatPacketTableSQL = `
	CREATE TABLE IF NOT EXISTS ` + PacketTable + ` (
	    ngap_type String ,
	    ngap_procedure_code String ,
	    ran_ue_ngap_id Int64 ,
    	packet_len UInt32 ,
    	arrive_time_us Int64 ,
        arrive_time DateTime64(6) ,
    	time_interval UInt64 ,
    	verification_tag UInt64 ,
	    src_ip String ,
	    dst_ip String ,
	    dir_seq Int8 ,
	    flow_ue_id String ,
     	flow_time_id String ,
		initiating_message UInt8 ,
		successful_outcome UInt8 ,
		unsuccessful_outcome UInt8 ,
	    status_packet UInt16 ,

		INDEX i_ran_ue_ngap_id (ran_ue_ngap_id) TYPE minmax GRANULARITY 4, 
		INDEX i_packet_len (packet_len) TYPE minmax GRANULARITY 4, 
		INDEX i_arrive_time_us (arrive_time_us) TYPE minmax GRANULARITY 4, 
		INDEX i_arrive_time (arrive_time) TYPE minmax GRANULARITY 4, 
		INDEX i_time_interval (time_interval) TYPE minmax GRANULARITY 4, 
		INDEX i_src_ip (src_ip) TYPE minmax GRANULARITY 4, 
		INDEX i_dst_ip (dst_ip) TYPE minmax GRANULARITY 4, 
		INDEX i_dir_seq (dir_seq) TYPE minmax GRANULARITY 4, 
		INDEX i_flow_ue_id (flow_ue_id) TYPE minmax GRANULARITY 4, 
		INDEX i_flow_time_id (flow_time_id) TYPE minmax GRANULARITY 4
		)  
		ENGINE = MergeTree()
        PARTITION BY toYYYYMMDD(arrive_time)
		ORDER BY (arrive_time)`

// TTL arrive_time + INTERVAL 7 DAY `

var dropPacketTableSQL = "DROP TABLE " + PacketTable

func (fl *Packet) initFlowLog() {
	//TODO init
}

func (fl Packet) String() string {
	return fmt.Sprintf(`
            NgapType: %s,
            NgapProcedureCode: %s,
		    RanUeNgapId: %u,
            PacketLen: %u,
            ArriveTimeUs: %u,
            ArriveTime: %s,
            TimeInterval: %u,
		    VerificationTag: %u,
		    SrcIP: %s, 
		    DstIP: %s,
            DirSeq: %u,
            FlowUEID: %s,
            FlowTimeID: %s,
		    StatusFlow: %u
		`, fl.NgapType, fl.NgapProcedureCode, fl.RanUeNgapId, fl.PacketLen,
		fl.ArriveTimeUs, fl.ArriveTime, fl.TimeInterval, fl.VerificationTag, fl.SrcIP, fl.DstIP,
		fl.DirSeq, fl.FlowUEID, fl.FlowTimeID, fl.StatusPacket)
}

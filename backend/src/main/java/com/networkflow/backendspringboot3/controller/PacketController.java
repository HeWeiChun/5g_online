package com.networkflow.backendspringboot3.controller;

import com.networkflow.backendspringboot3.common.R;
import com.networkflow.backendspringboot3.service.PacketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/packet")
@Tag(name = "流量包表接口")
public class PacketController {
    @Autowired
    private PacketService packetService;

    @Operation(summary = "获取所有数据包信息")
    @GetMapping("/getAllPacket")
    public R getAllPacket() {
        return packetService.allPacket();
    }

    @Operation(summary = "获取所有UE聚合流信息")
    @GetMapping("/getPacketByFlowId")
    public R getPacketByFlowId(@RequestParam("flowId") String flowId,
                               @RequestParam("model") Integer model) {
        return packetService.getPacketByFlowId(flowId, model);
    }
}

package com.networkflow.backendspringboot3.service.impl;

import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.networkflow.backendspringboot3.common.R;
import com.networkflow.backendspringboot3.mapper.PacketMapper;
import com.networkflow.backendspringboot3.mapper.TaskMapper;
import com.networkflow.backendspringboot3.mapper.TimeFlowMapper;
import com.networkflow.backendspringboot3.mapper.UEFlowMapper;
import com.networkflow.backendspringboot3.model.domain.Packet;
import com.networkflow.backendspringboot3.model.domain.Task;
import com.networkflow.backendspringboot3.model.domain.TimeFlow;
import com.networkflow.backendspringboot3.model.domain.UEFlow;
import com.networkflow.backendspringboot3.model.request.TaskRequest;
import com.networkflow.backendspringboot3.service.TaskService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {
    private static final Log log = LogFactory.get();
    private final DetectTask detectTask;
    private final TaskManager taskManager;
    private final TaskMapper taskMapper;
    private final TimeFlowMapper timeFlowMapper;
    private final UEFlowMapper ueFlowMapper;
    private final PacketMapper packetMapper;

    @Autowired
    TaskServiceImpl(DetectTask detectTask, TaskManager taskManager, TaskMapper taskMapper, TimeFlowMapper timeFlowMapper, UEFlowMapper ueFlowMapper, PacketMapper packetMapper) {
        this.detectTask = detectTask;
        this.taskManager = taskManager;
        this.taskMapper = taskMapper;
        this.timeFlowMapper = timeFlowMapper;
        this.ueFlowMapper = ueFlowMapper;
        this.packetMapper = packetMapper;
    }

    // 在线检测
    // 100:错误 200:已停止 0:未开始 1:待开始 2:解析并检测中 3:检测中 4:已完成
    @Override
    public R allTask() {
        QueryWrapper<Task> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda().orderByDesc(Task::getCreate_time);
        return R.success(null, taskMapper.selectList(queryWrapper));
    }

    // 上传文件(返回任务id命名的名字)
    private String uploadFile(MultipartFile uploadFile, String taskId) {
        if (uploadFile == null) {
            return null;
        }
        String fileName = uploadFile.getOriginalFilename();
        // 求文件后缀
        String extension = "";
        if (fileName != null) {
            int dotIndex = fileName.lastIndexOf('.');
            if (dotIndex != -1 && dotIndex < fileName.length() - 1) {
                extension = fileName.substring(dotIndex + 1);
            }
        }
        String trueFileName = taskId + "." + extension;

        // 检查文件存储位置是否存在
        String filePath = System.getProperty("user.dir") + System.getProperty("file.separator") + "core" + System.getProperty("file.separator") + "upload";
        File file = new File(filePath);
        if (!file.exists()) {
            if (!file.mkdir()) {
                return null;
            }
        }
        // 文件路径
        File dest = new File(filePath + System.getProperty("file.separator") + trueFileName);
        try {
            uploadFile.transferTo(dest);
            return trueFileName;
        } catch (IOException e) {
            return null;
        }
    }

    private void deleteCache(String taskId) {
        timeFlowMapper.delete(new QueryWrapper<TimeFlow>().lambda().eq(TimeFlow::getTask_id, taskId));
        List<UEFlow> ueFlowList = ueFlowMapper.selectList(new QueryWrapper<UEFlow>().lambda().eq(UEFlow::getTask_id, taskId));
        String[] flowIds = ueFlowList.stream()
                .map(UEFlow::getFlow_id)
                .toArray(String[]::new);
        if(flowIds.length>0)
            packetMapper.delete(new QueryWrapper<Packet>().lambda().in(Packet::getFlow_ue_id, Arrays.asList(flowIds)));
        ueFlowMapper.delete(new QueryWrapper<UEFlow>().lambda().eq(UEFlow::getTask_id, taskId));
    }

    @Override
    public R createOfflineTask(TaskRequest createTaskRequest, MultipartFile uploadFile) {
        Task task = new Task();
        BeanUtils.copyProperties(createTaskRequest, task);

        String trueFileName = uploadFile(uploadFile, createTaskRequest.getTask_id());
        if (trueFileName != null) {
            task.setPcap_path(uploadFile.getOriginalFilename());
            task.setTrue_pcap_path(trueFileName);
        } else {
            return R.fatal("上传文件失败");
        }

        if (taskMapper.insert(task) > 0) {
            return R.success("添加成功");
        } else {
            return R.error("添加失败");
        }
    }

    @Override
    public R createOnlineTask(TaskRequest createTaskRequest) {
        Task task = new Task();
        BeanUtils.copyProperties(createTaskRequest, task);
        if (taskMapper.insert(task) > 0) {
            return R.success("添加成功");
        } else {
            return R.error("添加失败");
        }
    }

    @Override
    public R updateTask(TaskRequest createTaskRequest, MultipartFile uploadFile) {
        Task task = new Task();
        BeanUtils.copyProperties(createTaskRequest, task);

        String trueFileName = uploadFile(uploadFile, createTaskRequest.getTask_id());
        if (trueFileName != null) {
            task.setPcap_path(uploadFile.getOriginalFilename());
            task.setTrue_pcap_path(trueFileName);
        } else {
            return R.fatal("上传文件失败");
        }

        if (taskMapper.updateById(task) > 0) {
            return R.success("更新成功");
        } else {
            return R.error("更新失败");
        }
    }

    @Override
    public R updateTaskStatus(String taskId, Integer status) {
        Task task = new Task();
        task.setTask_id(taskId);
        task.setStatus(status);
        if (taskMapper.updateById(task) > 0) {
            return R.success("更新成功");
        } else {
            return R.error("更新失败");
        }
    }


    @Override
    public R deleteTask(String[] taskIds) {
        for (String taskId : taskIds) {
            deleteCache(taskId);
            // 检查文件存储位置是否存在
            String filename = taskMapper.selectById(taskId).getTrue_pcap_path();
            String filePath = System.getProperty("user.dir") + System.getProperty("file.separator") + "core" +
                    System.getProperty("file.separator") + "upload" + System.getProperty("file.separator") + filename;
            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    log.info("任务: "+taskId + " 清理流量文件 "+ filename+ " 成功");
                } else {
                    log.info("任务: "+taskId + " 清理流量文件 "+ filename+ " 失败");
                }
            } else {
                log.info("任务: "+taskId + " 流量文件 " + filename + " 不存在");
            }
        }
        if (taskMapper.deleteBatchIds(Arrays.asList(taskIds)) > 0) {
            return R.success("删除成功");
        } else {
            return R.error("删除失败");
        }
    }

    @Override
    public boolean updateTaskByTask(Task task) {
        return taskMapper.updateById(task) > 0;
    }

    @Override
    public R startTask(String[] taskIds) {
        int successCount = 0;
        for (String taskId : taskIds) {
            UpdateWrapper<Task> updateWrapper = Wrappers.update();
            updateWrapper.lambda().set(Task::getStatus, 1).
                    set(Task::getStart_time, null).
                    set(Task::getEnd_time, null).
                    set(Task::getAbnormal, null).
                    set(Task::getNormal, null).
                    set(Task::getTotal, null).
                    eq(Task::getTask_id, taskId);
            // 清除缓存
            deleteCache(taskId);
            if (taskMapper.update(null, updateWrapper) > 0) {
                successCount++;
            }
        }
        if (successCount == taskIds.length) {
            return R.success("开始成功");
        } else if (successCount > 0 && successCount < taskIds.length) {
            return R.success("部分开始成功");
        } else {
            return R.error("开始失败");
        }
    }

    @Override
    public R stopTask(String[] taskIds) {
        int successCount = 0;
        for (String taskId : taskIds) {
            taskManager.stopTask(taskId);
            UpdateWrapper<Task> updateWrapper = Wrappers.update();
            updateWrapper.lambda().set(Task::getStatus, 200).
                    eq(Task::getTask_id, taskId);
            if (taskMapper.update(null, updateWrapper) > 0) {
                successCount++;
            }
        }
        if (successCount == taskIds.length) {
            return R.success("停止成功");
        } else if (successCount > 0 && successCount < taskIds.length) {
            return R.success("部分停止成功");
        } else {
            return R.error("停止失败");
        }
    }

    @Scheduled(cron = "0/5 * *  * * ? ")
    @Override
    public void checkStatus() {
        // log.info("轮询数据库, 线程名字为 = " + Thread.currentThread().getName());

        QueryWrapper<Task> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda().eq(Task::getStatus, 1);
        List<Task> list = taskMapper.selectList(queryWrapper);

        for (Task task : list) {
            String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            task.setStatus(2);
            task.setStart_time(LocalDateTime.parse(currentTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            taskMapper.updateById(task);
            if (taskMapper.updateById(task) > 0) {
                detectTask.executeScript(task);
            } else {
                log.info("启动失败");
            }
        }
    }
}

@Component
class DetectTask {
    private static final Log log = LogFactory.get();
    private final TaskManager taskManager;
    private final TaskMapper taskMapper;


    DetectTask(TaskManager taskManager, TaskMapper taskMapper) {
        this.taskManager = taskManager;
        this.taskMapper = taskMapper;
    }

    @Async("checkTaskPool")
    public void executeScript(Task currentTask) {
        try {
            String line;
            BufferedReader reader;
            // 启动脚本
            log.info("任务: " + currentTask.getTask_id() + " 执行检测, 线程名字为 = " + Thread.currentThread().getName());
            ProcessBuilder processBuilder = new ProcessBuilder("/home/whe/anaconda3/envs/xgboost39/bin/python", System.getProperty("user.dir") + System.getProperty("file.separator") + "core" +
                    System.getProperty("file.separator") + "main.py", "--taskid", currentTask.getTask_id(), "--model", String.valueOf(currentTask.getModel()), "--mode", String.valueOf(currentTask.getMode()));
            processBuilder.redirectErrorStream(true); // 合并标准输出和标准错误流
            Process process = processBuilder.start();
            taskManager.addTaskProcess(currentTask.getTask_id(), process);
            log.info("任务: " + currentTask.getTask_id() + " 检测脚本运行的PID为:" + process.pid());
            reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
            while ((line = reader.readLine()) != null) {
                log.info("任务: " + currentTask.getTask_id() + " " + line);
            }
            int exitCode = process.waitFor();
            reader.close();
            taskManager.stopTask(currentTask.getTask_id());
            log.info("任务: " + currentTask.getTask_id() + " 检测成功, 已停止, 退出码为: " + exitCode);
        } catch (IOException | InterruptedException e) {
            log.error("错误: ", e);
            Task task = new Task();
            task.setTask_id(currentTask.getTask_id());
            task.setStatus(100);
            taskMapper.updateById(task);
            taskManager.stopTask(currentTask.getTask_id());
            log.info("任务: " + currentTask.getTask_id() + " 检测失败, 已停止");
        }
    }
}

@Component
class TaskManager {
    private static final Log log = LogFactory.get();
    private final Map<String, Process> taskProcesses = new ConcurrentHashMap<>();

    public void addTaskProcess(String taskId, Process process) {
        taskProcesses.put(taskId, process);
        log.info("添加任务: "+ taskId + " Map中任务数: " + taskProcesses.size());
    }

    public void stopTask(String taskId) {
        Process process = taskProcesses.get(taskId);
        if (process != null) {
            process.destroy();
            taskProcesses.remove(taskId);
        }
        log.info("删除任务: "+ taskId + " Map中任务数: " + taskProcesses.size());
    }
}
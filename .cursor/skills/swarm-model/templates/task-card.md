# 任务卡片模板

> 此模板用于架构师生成任务卡片，开发者按卡片内容执行。

---

## 任务卡片 #{{TASK_ID}}

### 元信息

| 字段 | 值 |
|------|-----|
| **创建时间** | {{TIMESTAMP}} |
| **优先级** | [高/中/低] |
| **预计文件数** | {{FILE_COUNT}} |
| **依赖任务** | [无 / #N] |

---

### 上下文边界

**必须读取的文件** (共 {{FILE_COUNT}} 个):

```
{{FILE_PATH_1}}
{{FILE_PATH_2}}
{{FILE_PATH_3}}
...
```

**依赖信息** (来自其他任务或全局):

```
{{DEPENDENCY_INFO}}
```

---

### 任务目标

{{ONE_LINE_OBJECTIVE}}

---

### 详细说明

{{DETAILED_DESCRIPTION}}

---

### 输入

**必需数据**:
- {{INPUT_1}}
- {{INPUT_2}}

**当前状态**:
- {{CURRENT_STATE}}

---

### 预期输出

**必须产出**:

- [ ] {{OUTPUT_CRITERIA_1}}
- [ ] {{OUTPUT_CRITERIA_2}}
- [ ] {{OUTPUT_CRITERIA_3}}

**验收标准**:

1. {{ACCEPTANCE_1}}
2. {{ACCEPTANCE_2}}

---

### 约束

**禁止操作**:
- 不读取: {{FORBIDDEN_READ_FILES}}
- 不修改: {{FORBIDDEN_MODIFY_FILES}}

**限制条件**:
- 最大修改行数: {{MAX_LINES}}
- 保持接口兼容: [是/否]

---

### 执行提示

{{OPTIONAL_TIPS}}

---

## 执行报告 (由开发者填写)

> 完成任务后，在此填写执行报告。

### 执行状态

- [ ] 已完成
- [ ] 部分完成
- [ ] 阻塞

### 修改摘要

| 文件 | 操作 | 行数变化 |
|------|------|----------|
| {{FILE}} | [新增/修改/删除] | +/-{{LINES}} |

### 输出内容

```
{{ACTUAL_OUTPUT}}
```

### 遇到的问题

{{ISSUES_ENCOUNTERED}}

### 后续建议

{{SUGGESTIONS}}

---

*卡片结束*

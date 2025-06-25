# 工作区智能体列表分页和滚动优化

## 概述

本更新将工作区智能体列表从前端分页和筛选调整为服务器端分页和筛选实现，同时添加了内容过多时的滚动支持。

## 主要变更

### 1. 数据结构调整

- **之前**: 使用 `allAgents`, `filteredAgents`, `pagedAgents` 等多个数组在前端处理分页
- **现在**: 使用单一 `agents` 对象（`PagedItems<AgentModel>`类型），直接存储服务器返回的分页数据

### 2. 筛选和分页逻辑

- **之前**: 在前端加载所有数据（size: 1000），然后在客户端进行筛选、排序和分页
- **现在**: 构建筛选参数发送到服务器，由后端处理筛选、排序和分页

### 3. 滚动支持

- 添加了 `scrollable` CSS 类，当内容超过一页时自动启用
- 设置最大高度为 `70vh`，超出时显示滚动条
- 添加渐变遮罩效果，提升视觉体验
- 自定义滚动条样式，支持 Webkit 和 Firefox

### 4. 用户体验优化

- 添加滚动提示指示器，当内容可滚动时显示
- 实现防抖搜索（300ms 延迟），减少不必要的 API 请求
- 翻页时自动滚动到内容顶部
- 保持响应式设计，在移动端优化滚动体验

## 技术实现

### 筛选逻辑重构

```javascript
function buildFilter() {
    let filterTypes = [AgentType.Task, AgentType.Routing];
    
    // 根据选择的类型进一步筛选
    if (selectedType === 'single') {
        filterTypes = [AgentType.Task];
    } else if (selectedType === 'group') {
        filterTypes = [AgentType.Routing];
    }

    return {
        pager: filter.pager,
        types: filterTypes,
        similarName: searchQuery.trim() || undefined,
    };
}
```

### 滚动样式

```css
.agents-grid.scrollable {
    max-height: 70vh;
    overflow-y: auto;
    scroll-behavior: smooth;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
```

### 防抖搜索

```javascript
let searchTimeout;
$: if (searchQuery !== undefined || selectedType !== undefined || sortBy !== undefined) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}
```

## 性能优化

1. **减少数据传输**: 不再加载所有数据，只加载当前页面需要的数据
2. **减少内存使用**: 移除了多个大型数组的客户端存储
3. **优化网络请求**: 通过防抖技术减少搜索时的 API 调用频率
4. **改善渲染性能**: 较少的 DOM 元素和更精确的数据更新

## 兼容性

- 保持与现有 API 接口的兼容性
- 支持现有的筛选选项（类型、搜索关键词）
- 保留所有现有的国际化文本键值
- 维持原有的 UI/UX 设计风格

## 新增语言键

在 `src/lib/langs/en.json` 和 `src/lib/langs/zh.json` 中添加：
- `workspace.agents.list.scroll_to_see_more`: "Scroll to see more" / "滚动查看更多"

## 文件修改

1. `src/routes/workspace/agents/+page.svelte` - 主要逻辑重构
2. `src/lib/langs/en.json` - 添加新的语言键
3. `src/lib/langs/zh.json` - 添加新的语言键

## 后端要求

确保后端 `getAgents` API 支持：
- 分页参数 (`pager.page`, `pager.size`)
- 类型筛选 (`types`)
- 模糊搜索 (`similarName`)
- 返回总数 (`count`)

这与现有的 `/page/agent` 路由实现保持一致。

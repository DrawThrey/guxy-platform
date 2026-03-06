/**
 * GUXY 体验自检模块
 * 结合本地交互规范结果与大模型，生成改进建议
 */

GUXY.SelfCheck = {
  /**
   * 对当前项目运行自检
   * @returns {Promise<object|null>}
   */
  async runOnCurrentProject() {
    const project = GUXY.State?.currentProject;
    if (!project) {
      GUXY.Toast?.show('请先选择项目', 'warning');
      return null;
    }
    if (!project.architecture) {
      GUXY.Toast?.show('暂无架构数据，无法进行自检', 'warning');
      return null;
    }

    const config = GUXY.State?.config?.api;
    if (!config || !config.apiKey || !config.baseUrl) {
      GUXY.Toast?.show('请先在 GUXY.State.config.api 中配置大模型 API 信息', 'error');
      return null;
    }

    try {
      GUXY.State?.setLoading(true);
      GUXY.Toast?.show('正在进行体验自检...', 'info');

      // 先运行一次本地交互规范检查（若尚未有结果）
      const specReport =
        project.interactionSpecReport ||
        GUXY.InteractionSpec?.checkArchitecture(project.architecture);

      const summary = this.buildSummary(project, specReport);

      const messages = [
        {
          role: 'system',
          content:
            '你是一名资深游戏交互设计评审专家，请根据提供的架构和交互规范检查结果，给出体验问题和改进建议。回答时使用 Markdown 分段，包含“整体评价”、“主要问题”、“改进建议”、“潜在风险”。'
        },
        {
          role: 'user',
          content: summary
        }
      ];

      const aiMessage = await GUXY.Utils.callAIModel(
        config.model || 'glm-4-flash',
        config.apiKey,
        config.baseUrl,
        messages
      );

      const report = {
        generatedAt: new Date().toISOString(),
        projectId: project.id,
        specScore: specReport?.score ?? null,
        specReport,
        aiContent: aiMessage.content || '',
        model: config.model || 'glm-4-flash'
      };

      // 保存到项目和状态
      GUXY.State.updateProject(project.id, {
        selfCheckReport: report
      });

      // 记录到 Workflow 步骤⑥
      if (GUXY.Workflow) {
        GUXY.Workflow.saveStepData(6, {
          selfCheckReport: report
        });
      }

      // 写入日志
      await GUXY.DB.addWorkflowLog({
        projectId: project.id,
        step: 6,
        type: 'self_check',
        data: report
      });

      // 展示结果
      this.showReport(report);

      GUXY.State?.setLoading(false);
      GUXY.Toast?.show('自检完成', 'success');

      return report;
    } catch (error) {
      console.error('Self check error:', error);
      GUXY.State?.setLoading(false);
      GUXY.Toast?.show(`自检失败: ${error.message}`, 'error');
      return null;
    }
  },

  /**
   * 构建发送给 AI 的摘要
   */
  buildSummary(project, specReport) {
    const arch = project.architecture || {};
    const payload = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description || ''
      },
      stats: {
        collections: arch.collections?.length || 0,
        cards: arch.cards?.length || 0,
        edges: arch.edges?.length || 0
      },
      collections: (arch.collections || []).map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description || ''
      })),
      cards: (arch.cards || []).map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        interface_level: c.interface_level,
        collection_id: c.collection_id
      })),
      edges: arch.edges || [],
      interactionSpec: specReport || null
    };

    return `以下是一个游戏的交互架构与静态交互规范检查结果，请从「体验流畅度、信息结构合理性、交互一致性、易用性、边缘情况」几个角度给出评审意见和优先级排序的改进建议。\n\n${JSON.stringify(
      payload,
      null,
      2
    )}`;
  },

  /**
   * 使用 Modal 展示自检报告
   * @param {object} report
   */
  showReport(report) {
    if (!GUXY.Modal) {
      console.warn('Modal module not available');
      return;
    }

    const specScore =
      report.specScore !== null && report.specScore !== undefined
        ? `${report.specScore} / 100`
        : '无';

    const html = `
      <div class="self-check-report">
        <p><strong>交互规范得分:</strong> ${specScore}</p>
        <p><strong>模型:</strong> ${report.model}</p>
        <hr />
        <div class="self-check-ai-content">
          <pre style="white-space:pre-wrap;font-size:12px;">${GUXY.Utils.escapeHtml?.(
            report.aiContent
          ) || report.aiContent}</pre>
        </div>
      </div>
    `;

    GUXY.Modal.show('体验自检结果', html);
  }
};

// Node 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GUXY.SelfCheck;
}


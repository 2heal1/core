import React, { useEffect, useMemo, useState } from 'react';

import './App.css';
import styles from './App.module.scss';
import { MESSAGE_ACTIVE_TAB_CHANGED } from './utils/chrome/messages';

const IIFE_BUNDLE_PATH = 'garfish/packages/vmok/proxy-sdk/dist/iife.js';
const PACKAGE_NAME = '@vmok/proxy-sdk';

const iifeSnippet = `<script src="./iife.js"></script>
<script>
  window.VmokProxySdk.bootstrapProxy({
    data: {
      overrides: {
        '@demo/remote': 'http://localhost:3000/mf-manifest.json',
      },
    },
  });
</script>`;

const esmSnippet = `import { bootstrapProxy } from '${PACKAGE_NAME}';

bootstrapProxy({
  data: {
    overrides: {
      '@demo/remote': 'http://localhost:3000/mf-manifest.json',
    },
  },
});`;

const getInitialTabId = () => {
  try {
    return chrome?.devtools?.inspectedWindow?.tabId;
  } catch {
    return undefined;
  }
};

export default function App() {
  const [activeTabId, setActiveTabId] = useState<number | undefined>(() =>
    getInitialTabId(),
  );

  useEffect(() => {
    const listener = (message: { type?: string; tabId?: number }) => {
      if (
        message?.type === MESSAGE_ACTIVE_TAB_CHANGED &&
        typeof message.tabId === 'number'
      ) {
        setActiveTabId(message.tabId);
      }
    };

    try {
      chrome?.runtime?.onMessage?.addListener(listener);
      return () => chrome?.runtime?.onMessage?.removeListener(listener);
    } catch {
      return undefined;
    }
  }, []);

  const steps = useMemo(
    () => [
      `在内部 Garfish 仓库构建 ${PACKAGE_NAME}。`,
      `取用压缩产物 ${IIFE_BUNDLE_PATH}，该产物已配置为 minify 且不输出 SourceMap。`,
      '将产物复制到当前 Chrome 插件可访问目录，或通过外部静态资源地址引入。',
      '按照下方 IIFE / ESM 示例执行初始化，替代仓库内原有 proxy/security 实现。',
      '当前 security helper 默认禁用，待 allowlist / strictMode 配置补齐后再启用。',
    ],
    [],
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.badge}>Proxy / Security Placeholder</div>
        <h1 className={styles.title}>Module Federation Chrome Devtools</h1>
        <p className={styles.description}>
          原有的 proxy / security 注入逻辑已经迁移到内部 Garfish 包
          <code>{PACKAGE_NAME}</code>。
          当前仓库只保留一个干净的占位入口，用于指导你粘贴或引入构建后的压缩产物；
          security helper 现阶段默认禁用，待后续配置完成后再恢复。
        </p>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>目标包：{PACKAGE_NAME}</span>
          <span className={styles.metaItem}>
            当前 Inspect Tab：
            {typeof activeTabId === 'number' ? activeTabId : '未连接'}
          </span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>迁移后的使用方式</h2>
        <ol className={styles.stepList}>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>IIFE 直接粘贴</h2>
            <span className={styles.cardHint}>适合复制压缩后的单文件产物</span>
          </div>
          <pre className={styles.codeBlock}>
            <code>{iifeSnippet}</code>
          </pre>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>ESM / 包引用</h2>
            <span className={styles.cardHint}>适合集成到内部工程脚本</span>
          </div>
          <pre className={styles.codeBlock}>
            <code>{esmSnippet}</code>
          </pre>
        </article>
      </section>

      <section className={styles.notice}>
        <h2 className={styles.cardTitle}>说明</h2>
        <p>
          当前扩展不再内置任何 proxy / security 运行时代码，也不会自动注入
          <code>__FEDERATION__.__GLOBAL_PLUGIN__</code>。
          若需要恢复相关能力，请仅通过外部引入的 {PACKAGE_NAME} 构建产物完成，
          并在补齐 allowlist / strictMode 配置后再启用 security helper。
        </p>
      </section>
    </main>
  );
}

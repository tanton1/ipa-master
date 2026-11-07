import { Fragment } from 'react';

/** Giữ mỗi ký hiệu /…/ trên một dòng, để tiêu đề không bị ngắt thành "/" và "ð/". */
export function IpaText({ text }: { text: string }) {
  const parts = text.split(/(\/[^/\s][^/]{0,24}\/)/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} className="whitespace-nowrap">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

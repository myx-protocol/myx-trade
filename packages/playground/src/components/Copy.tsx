import { CopyIcon } from "@components/Icon";
import { useCopyToClipboard } from 'usehooks-ts'
import { message } from "antd";

export const Copy = ({content, className = ''}: {content: string, className?:string}) => {
  const [, copy] = useCopyToClipboard()
  const onCopy = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation()
    if (content) {
      copy(content).then((rs) => rs )
      message.success ("Copied!").then ()
    }
  }
  return <span className={`w-[12px] h-[12px] text-basic-white ${className}`} onClick={onCopy }>
    <CopyIcon size={16} />
  </span>
}

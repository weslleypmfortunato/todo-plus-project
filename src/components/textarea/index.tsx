import { HTMLProps } from "react";

export function Textarea ({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return <textarea 
          className="border border-gray-400 w-full resize-none h-40 rounded outline-none p-2"
          {...rest}>

         </textarea>
}
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  id: string
  hint?: string
}

// Ensure the props include the ref type from react-hook-form
type FormFieldProps = BaseProps & 
  (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>) & 
  { as?: 'input' | 'textarea' }

const baseInputClassName =
  'mt-2 w-full rounded-xl border border-brand-cloud bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-ember focus:ring-2 focus:ring-brand-ember/20'

export default function FormField(props: FormFieldProps) {
  const { label, id, hint, as = 'input', className, ...rest } = props

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-brand-ink">
      {label}
      {as === 'textarea' ? (
        <textarea 
          id={id} 
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} 
          className={[baseInputClassName, className || ''].join(' ')} 
        />
      ) : (
        <input 
          id={id} 
          {...(rest as InputHTMLAttributes<HTMLInputElement>)} 
          className={[baseInputClassName, className || ''].join(' ')} 
        />
      )}
      {hint ? <span className="mt-1 block text-xs font-normal text-brand-slate">{hint}</span> : null}
    </label>
  )
}

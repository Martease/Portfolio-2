import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  id: string
  hint?: string
}

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input'
  }

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea'
  }

type FormFieldProps = InputFieldProps | TextareaFieldProps

const baseInputClassName =
  'mt-2 w-full rounded-xl border border-brand-cloud bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-ember focus:ring-2 focus:ring-brand-ember/20'

export default function FormField(props: FormFieldProps) {
  const { label, id, hint } = props

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-brand-ink">
      {label}
      {props.as === 'textarea' ? (() => {
        const { as: _as, label: _label, hint: _hint, className, ...textareaProps } = props
        return <textarea id={id} {...textareaProps} className={[baseInputClassName, className || ''].join(' ')} />
      })() : (() => {
        const { as: _as, label: _label, hint: _hint, className, ...inputProps } = props
        return <input id={id} {...inputProps} className={[baseInputClassName, className || ''].join(' ')} />
      })()}
      {hint ? <span className="mt-1 block text-xs font-normal text-brand-slate">{hint}</span> : null}
    </label>
  )
}

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STEP_TYPES = [
  'navigate',
  'click',
  'fill',
  'select',
  'hover',
  'wait',
  'screenshot',
  'assert',
  'api-call',
  'db-query',
] as const;

type StepType = (typeof STEP_TYPES)[number];

export interface Step {
  type: StepType;
  params: Record<string, unknown>;
  description?: string;
}

const ASSERT_CHECK_TYPES = ['visible', 'not-visible', 'text-contains', 'text-equals'] as const;
const API_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

function getParam(step: Step, key: string): string {
  return (step.params[key] as string) ?? '';
}

function getNumParam(step: Step, key: string): number | '' {
  const v = step.params[key];
  return typeof v === 'number' ? v : '';
}

interface StepParamsProps {
  step: Step;
  onParamChange: (key: string, value: unknown) => void;
}

function StepParams({ step, onParamChange }: StepParamsProps) {
  switch (step.type) {
    case 'navigate':
      return (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={getParam(step, 'url')}
            onChange={(e) => onParamChange('url', e.target.value)}
            placeholder="https://example.com/page"
          />
        </div>
      );

    case 'click':
      return (
        <div className="space-y-2">
          <Label>Selector</Label>
          <Input
            value={getParam(step, 'selector')}
            onChange={(e) => onParamChange('selector', e.target.value)}
            placeholder='button[data-testid="submit"]'
          />
        </div>
      );

    case 'fill':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Selector</Label>
            <Input
              value={getParam(step, 'selector')}
              onChange={(e) => onParamChange('selector', e.target.value)}
              placeholder='input[name="email"]'
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={getParam(step, 'value')}
              onChange={(e) => onParamChange('value', e.target.value)}
              placeholder="test@example.com"
            />
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Selector</Label>
            <Input
              value={getParam(step, 'selector')}
              onChange={(e) => onParamChange('selector', e.target.value)}
              placeholder='select[name="country"]'
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={getParam(step, 'value')}
              onChange={(e) => onParamChange('value', e.target.value)}
              placeholder="US"
            />
          </div>
        </div>
      );

    case 'hover':
      return (
        <div className="space-y-2">
          <Label>Selector</Label>
          <Input
            value={getParam(step, 'selector')}
            onChange={(e) => onParamChange('selector', e.target.value)}
            placeholder='.menu-trigger'
          />
        </div>
      );

    case 'wait':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Selector (optional)</Label>
            <Input
              value={getParam(step, 'selector')}
              onChange={(e) => onParamChange('selector', e.target.value)}
              placeholder='.loading-spinner'
            />
          </div>
          <div className="space-y-2">
            <Label>Timeout (ms)</Label>
            <Input
              type="number"
              value={getNumParam(step, 'timeout')}
              onChange={(e) =>
                onParamChange('timeout', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="5000"
            />
          </div>
        </div>
      );

    case 'screenshot':
      return (
        <div className="space-y-2">
          <Label>Name (optional)</Label>
          <Input
            value={getParam(step, 'name')}
            onChange={(e) => onParamChange('name', e.target.value)}
            placeholder="after-login"
          />
        </div>
      );

    case 'assert':
      return (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Check type</Label>
            <Select
              value={getParam(step, 'checkType') || 'visible'}
              onValueChange={(v) => onParamChange('checkType', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSERT_CHECK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Selector</Label>
            <Input
              value={getParam(step, 'selector')}
              onChange={(e) => onParamChange('selector', e.target.value)}
              placeholder='[data-testid="welcome"]'
            />
          </div>
          <div className="space-y-2">
            <Label>Expected (optional)</Label>
            <Input
              value={getParam(step, 'expected')}
              onChange={(e) => onParamChange('expected', e.target.value)}
              placeholder="Welcome back"
            />
          </div>
        </div>
      );

    case 'api-call':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={getParam(step, 'method') || 'GET'}
                onValueChange={(v) => onParamChange('method', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={getParam(step, 'url')}
                onChange={(e) => onParamChange('url', e.target.value)}
                placeholder="/api/users"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Body (optional)</Label>
            <Textarea
              value={getParam(step, 'body')}
              onChange={(e) => onParamChange('body', e.target.value)}
              placeholder='{"name": "test"}'
              rows={3}
            />
          </div>
        </div>
      );

    case 'db-query':
      return (
        <div className="space-y-2">
          <Label>Query</Label>
          <Textarea
            value={getParam(step, 'query')}
            onChange={(e) => onParamChange('query', e.target.value)}
            placeholder="SELECT * FROM users WHERE email = 'test@example.com'"
            rows={3}
          />
        </div>
      );

    default:
      return null;
  }
}

interface StepEditorProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export function StepEditor({ steps, onChange }: StepEditorProps) {
  function updateStep(index: number, patch: Partial<Step>) {
    const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function updateParam(index: number, key: string, value: unknown) {
    const step = steps[index]!;
    updateStep(index, { params: { ...step.params, [key]: value } });
  }

  function changeType(index: number, type: StepType) {
    updateStep(index, { type, params: {} });
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function addStep() {
    onChange([...steps, { type: 'click', params: {} }]);
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              {index + 1}
            </span>
            <div className="w-40">
              <Select value={step.type} onValueChange={(v) => changeType(index, v as StepType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveStep(index, -1)}
                disabled={index === 0}
              >
                &#x25B2;
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveStep(index, 1)}
                disabled={index === steps.length - 1}
              >
                &#x25BC;
              </Button>
              <Button variant="destructive" size="icon-xs" onClick={() => removeStep(index)}>
                &#x2715;
              </Button>
            </div>
          </div>
          <StepParams step={step} onParamChange={(key, value) => updateParam(index, key, value)} />
        </div>
      ))}

      <Button variant="outline" onClick={addStep} className="w-full">
        + Add step
      </Button>
    </div>
  );
}

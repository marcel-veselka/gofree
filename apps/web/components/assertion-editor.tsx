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

const ASSERTION_TYPES = [
  'equals',
  'contains',
  'matches',
  'visible',
  'not-visible',
  'status-code',
  'json-path',
  'row-count',
] as const;

type AssertionType = (typeof ASSERTION_TYPES)[number];

export interface Assertion {
  type: AssertionType;
  target?: string;
  expected?: unknown;
  description?: string;
}

interface AssertionEditorProps {
  assertions: Assertion[];
  onChange: (assertions: Assertion[]) => void;
}

export function AssertionEditor({ assertions, onChange }: AssertionEditorProps) {
  function updateAssertion(index: number, patch: Partial<Assertion>) {
    const next = assertions.map((a, i) => (i === index ? { ...a, ...patch } : a));
    onChange(next);
  }

  function removeAssertion(index: number) {
    onChange(assertions.filter((_, i) => i !== index));
  }

  function addAssertion() {
    onChange([...assertions, { type: 'equals', target: '', expected: '' }]);
  }

  return (
    <div className="space-y-3">
      {assertions.map((assertion, index) => (
        <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-muted-foreground">Assertion</span>
            <div className="ml-auto">
              <Button
                variant="destructive"
                size="icon-xs"
                onClick={() => removeAssertion(index)}
              >
                &#x2715;
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={assertion.type}
                onValueChange={(v) => updateAssertion(index, { type: v as AssertionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSERTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Input
                value={assertion.target ?? ''}
                onChange={(e) => updateAssertion(index, { target: e.target.value })}
                placeholder="selector, path, or query"
              />
            </div>

            <div className="space-y-2">
              <Label>Expected value</Label>
              <Input
                value={(assertion.expected as string) ?? ''}
                onChange={(e) => updateAssertion(index, { expected: e.target.value })}
                placeholder="expected result"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={assertion.description ?? ''}
                onChange={(e) => updateAssertion(index, { description: e.target.value })}
                placeholder="Verify user sees welcome message"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addAssertion} className="w-full">
        + Add assertion
      </Button>
    </div>
  );
}

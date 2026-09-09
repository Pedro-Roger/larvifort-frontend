"use client";

import { CaretDown, Warning } from "@phosphor-icons/react";

interface WorkloadCardProps {
  name: string;
  initials: string;
  notDone: number;
  done: number;
  timeEstimate: { notDone: string; done: string };
  remaining: string;
  ready: number;
  inProgress: number;
  review: number;
}

export default function WorkloadCard({
  name,
  initials,
  notDone,
  done,
  timeEstimate,
  remaining,
  ready,
  inProgress,
  review,
}: WorkloadCardProps) {
  const total = notDone + done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-600">
            {initials}
          </div>
          <h3 className="text-base font-semibold text-slate-800">{name}</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <CaretDown size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-6">
          <div>
            <span className="text-2xl font-bold text-slate-800">{notDone}</span>
            <p className="text-xs text-slate-500 mt-0.5">Not done</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800">{done}</span>
            <p className="text-xs text-slate-500 mt-0.5">Done</p>
          </div>
        </div>
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
            {pct}%
          </span>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-100 mb-4 overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-sky-500 h-full"
            style={{ width: `${total > 0 ? (ready / total) * 100 : 0}%` }}
          />
          <div
            className="bg-violet-500 h-full"
            style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
          />
          <div
            className="bg-amber-400 h-full"
            style={{ width: `${total > 0 ? (review / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-sky-600">TIME ESTIMATE</span>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {remaining} remaining
          </span>
        </div>

        <div className="flex gap-4 text-xs text-slate-500">
          <span>{timeEstimate.notDone} Not done</span>
          <span>{timeEstimate.done} Done</span>
        </div>

        {(ready > 0 || inProgress > 0 || review > 0) && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Warning size={12} weight="fill" />
            <span>{notDone} tasks without estimate</span>
          </div>
        )}

        <div className="pt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-600">READY</span>
            <span className="text-slate-500">({ready})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-600">IN PROGRESS</span>
            <span className="text-slate-500">({inProgress})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-500">REVIEW</span>
            <span className="text-slate-500">({review})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
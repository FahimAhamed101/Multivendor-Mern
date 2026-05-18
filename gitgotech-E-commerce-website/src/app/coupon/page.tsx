"use client";

import { useGetAllCouponsQuery, useTakeCouponMutation, useGetMyCouponsQuery } from "@/redux/features/coupon/couponSlice";
import { useState } from "react";
import toast from "react-hot-toast";
 

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  couponName: string;
  percentage: number;
  quantity: number;
  usedCount: number;
  startAt: string;
  expiresAt: string;
  minAmount: number | null;
  maxAmount: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyCoupon {
  _id: string;
  userId: string;
  couponId: string;
  isUsed: boolean;
  usedAt: string | null;
  whereUsed: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  coupon: Coupon;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: number;
    role: string;
  };
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function usagePercent(used: number, total: number): number {
  return total === 0 ? 0 : Math.round((used / total) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ active, expired }: { active: boolean; expired: boolean }) {
  if (expired)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Expired
      </span>
    );
  if (active)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = usagePercent(used, total);
  const color =
    pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="mt-1 w-full">
      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
        <span>{used} used</span>
        <span>{total} total</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
      {/* scissors notch effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" />
      </div>
      <span className="relative text-lg font-black text-white leading-none">
        {pct}%
      </span>
      <span className="relative text-[9px] font-bold text-indigo-200 absolute bottom-2">OFF</span>
    </div>
  );
}

function CouponCard({ coupon, onTakeCoupon, isTaking }: { coupon: Coupon; onTakeCoupon: (id: string) => void; isTaking: boolean }) {
  const expired = isExpired(coupon.expiresAt);
  const remaining = coupon.quantity - coupon.usedCount;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gray-900/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        expired ? "border-gray-700 opacity-70" : "border-gray-700 hover:border-purple-500"
      }`}
    >
      {/* dashed left border decoration */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-violet-600 rounded-l-2xl" />

      <div className="flex items-start gap-4">
        <DiscountBadge pct={coupon.percentage} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-white capitalize tracking-wide">
                {coupon.couponName}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-gray-400 select-all">
                #{coupon._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <StatusBadge active={coupon.isActive} expired={expired} />
          </div>

          {/* Date range */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(coupon.startAt)}
            </span>
            <span className="text-gray-600">→</span>
            <span className={expired ? "text-red-400 font-semibold" : ""}>
              {formatDate(coupon.expiresAt)}
            </span>
          </div>

          {/* Usage */}
          <div className="mt-3">
            <UsageBar used={coupon.usedCount} total={coupon.quantity} />
          </div>

          {/* Footer row */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              {remaining} remaining
            </span>
            {coupon.minAmount !== null && (
              <span className="text-[11px] text-gray-500">
                Min: ₵{coupon.minAmount}
              </span>
            )}
            {coupon.maxAmount !== null && (
              <span className="text-[11px] text-gray-500">
                Max: ₵{coupon.maxAmount}
              </span>
            )}
          </div>

          {/* Take Coupon Button */}
          <div className="mt-4">
            <button
              onClick={() => onTakeCoupon(coupon._id)}
              disabled={expired || !coupon.isActive || remaining <= 0 || isTaking}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTaking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Taking...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Take Coupon
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4 shadow-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-400">{label}</p>
    </div>
  );
}

// ─── My Coupon Card ───────────────────────────────────────────────────────────

function MyCouponCard({ myCoupon }: { myCoupon: MyCoupon }) {
  const coupon = myCoupon.coupon;
  const expired = isExpired(coupon.expiresAt);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gray-900/50 p-5 shadow-sm transition-all duration-300 ${
        myCoupon.isUsed ? "border-gray-700 opacity-60" : "border-gray-700 hover:border-purple-500 hover:shadow-md"
      }`}
    >
      {/* Status indicator */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
        myCoupon.isUsed ? "bg-gray-600" : "bg-gradient-to-b from-purple-500 to-violet-600"
      }`} />

      <div className="flex items-start gap-4">
        <DiscountBadge pct={coupon.percentage} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-white capitalize tracking-wide">
                {coupon.couponName}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-gray-400 select-all">
                #{coupon._id.slice(-8).toUpperCase()}
              </p>
            </div>
            {myCoupon.isUsed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-400 ring-1 ring-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                Used
              </span>
            ) : (
              <StatusBadge active={coupon.isActive} expired={expired} />
            )}
          </div>

          {/* Date range */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(coupon.startAt)}
            </span>
            <span className="text-gray-600">→</span>
            <span className={expired ? "text-red-400 font-semibold" : ""}>
              {formatDate(coupon.expiresAt)}
            </span>
          </div>

          {/* Coupon Info */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-gray-400">
              Taken: {formatDate(myCoupon.createdAt)}
            </span>
            {myCoupon.isUsed && myCoupon.usedAt && (
              <span className="text-gray-500">
                Used: {formatDate(myCoupon.usedAt)}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {coupon.percentage}% OFF
            </span>
            {coupon.minAmount !== null && (
              <span className="text-[11px] text-gray-500">
                Min: ₵{coupon.minAmount}
              </span>
            )}
            {coupon.maxAmount !== null && (
              <span className="text-[11px] text-gray-500">
                Max: ₵{coupon.maxAmount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CouponSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 p-5 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1 bg-purple-600 rounded-l-2xl" />
      <div className="flex items-start gap-4 animate-pulse">
        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-800" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded-full bg-gray-800" />
              <div className="h-2.5 w-20 rounded-full bg-gray-800" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-800" />
          </div>
          <div className="h-2.5 w-48 rounded-full bg-gray-800" />
          <div className="h-1.5 w-full rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  const { data: couponData, isLoading, isError, refetch } = useGetAllCouponsQuery({});
  const { data: myCouponData, isLoading: myLoading, refetch: refetchMy } = useGetMyCouponsQuery({});
  console.log(myCouponData)
  const [takeCoupon, { isLoading: isTaking }] = useTakeCouponMutation();

  const coupons: Coupon[] = couponData?.data?.data ?? [];
  const meta: Meta = couponData?.data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 };

  const myCoupons: MyCoupon[] = myCouponData?.data?.data ?? [];
  const myMeta: Meta = myCouponData?.data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleTakeCoupon = async (couponId: string) => {
    try {
      const res = await takeCoupon({ couponId }).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Coupon taken successfully!");
        refetch();
        refetchMy();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to take coupon");
    }
  };

  const filtered = coupons.filter((c) => {
    const matchSearch = c.couponName.toLowerCase().includes(search.toLowerCase());
    const expired = isExpired(c.expiresAt);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !expired && c.isActive) ||
      (filterStatus === "expired" && expired);
    return matchSearch && matchStatus;
  });

  const filteredMyCoupons = myCoupons.filter((mc) => {
    const matchSearch = mc.coupon.couponName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const activeCount = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const expiredCount = coupons.filter((c) => isExpired(c.expiresAt)).length;
  const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] mt-24 to-black font-sans">
      {/* ── Header ── */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-black via-[#0f0924] to-black px-6 py-5 shadow-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Coupons</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage discount codes &amp; promotions</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 rounded-xl border border-gray-700 bg-gray-900/50 p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              All Coupons
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                activeTab === "my"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              My Coupons ({myMeta.total})
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6 space-y-6">
        {/* ── Stats ── */}
        {activeTab === "all" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatsCard
              label="Total Coupons"
              value={meta.total}
              color="bg-purple-900/50 text-purple-400"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                </svg>
              }
            />
            <StatsCard
              label="Active"
              value={activeCount}
              color="bg-emerald-50 text-emerald-600"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="Expired"
              value={expiredCount}
              color="bg-red-50 text-red-500"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="Total Redeemed"
              value={totalUsed}
              color="bg-amber-50 text-amber-600"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          </div>
        )}

        {activeTab === "my" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatsCard
              label="My Coupons"
              value={myMeta.total}
              color="bg-purple-900/50 text-purple-400"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                </svg>
              }
            />
            <StatsCard
              label="Available"
              value={myCoupons.filter((mc) => !mc.isUsed && !isExpired(mc.coupon.expiresAt)).length}
              color="bg-emerald-50 text-emerald-600"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="Used"
              value={myCoupons.filter((mc) => mc.isUsed).length}
              color="bg-gray-700 text-gray-400"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              }
            />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search coupons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Status filter - Only show for "All Coupons" tab */}
          {activeTab === "all" && (
            <div className="flex gap-1 rounded-xl border border-gray-700 bg-gray-900/50 p-1 shadow-sm">
              {(["all", "active", "expired"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    filterStatus === s
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Coupon list ── */}
        {activeTab === "all" ? (
          isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <CouponSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/30 bg-red-900/20 py-16 text-center">
              <svg className="mb-3 w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-semibold text-red-400">Failed to load coupons</p>
              <button
                onClick={refetch}
                className="mt-3 rounded-lg bg-red-900/50 px-4 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/70 transition"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 py-16 text-center">
              <svg className="mb-3 w-10 h-10 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-400">No coupons found</p>
              <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} onTakeCoupon={handleTakeCoupon} isTaking={isTaking} />
              ))}
            </div>
          )
        ) : (
          myLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <CouponSkeleton key={i} />)}
            </div>
          ) : filteredMyCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 py-16 text-center">
              <svg className="mb-3 w-10 h-10 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-400">No coupons yet</p>
              <p className="mt-1 text-xs text-gray-500">Take coupons from the "All Coupons" tab</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyCoupons.map((myCoupon) => (
                <MyCouponCard key={myCoupon._id} myCoupon={myCoupon} />
              ))}
            </div>
          )
        )}

        {/* ── Pagination ── */}
        {activeTab === "all" ? (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing <span className="font-semibold text-white">{filtered.length}</span> of{" "}
              <span className="font-semibold text-white">{meta.total}</span> coupons
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={meta.page <= 1}
                className="rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-1.5 text-xs font-medium text-gray-400 shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 rounded-lg border border-purple-500 bg-purple-600/20 text-xs font-bold text-purple-400">
                {meta.page}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-1.5 text-xs font-medium text-gray-400 shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing <span className="font-semibold text-white">{filteredMyCoupons.length}</span> of{" "}
              <span className="font-semibold text-white">{myMeta.total}</span> coupons
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={myMeta.page <= 1}
                className="rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-1.5 text-xs font-medium text-gray-400 shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 rounded-lg border border-purple-500 bg-purple-600/20 text-xs font-bold text-purple-400">
                {myMeta.page}
              </span>
              <button
                disabled={myMeta.page >= myMeta.totalPages}
                className="rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-1.5 text-xs font-medium text-gray-400 shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
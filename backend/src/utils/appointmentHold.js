import { Appointment } from "../models/appointment.model.js"

export const PAYMENT_HOLD_MS = 10 * 60 * 1000

export function paymentDueAt(createdAt) {
  return new Date(new Date(createdAt).getTime() + PAYMENT_HOLD_MS)
}

/** Cancel unpaid holds older than 10 minutes so the slot frees up. */
export async function releaseExpiredUnpaidHolds(extraFilter = {}, options = {}) {
  const cutoff = new Date(Date.now() - PAYMENT_HOLD_MS)
  await Appointment.updateMany(
    {
      ...extraFilter,
      isPaid: false,
      status: { $in: ["pending", "confirmed"] },
      createdAt: { $lt: cutoff },
    },
    { $set: { status: "cancelled" } },
    options.session ? { session: options.session } : undefined
  )
}

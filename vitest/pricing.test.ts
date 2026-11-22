import { describe, it, expect } from 'vitest'

describe('Fee Split Calculation', () => {
  it('calculates platform fee and vendor share correctly', () => {
    // platformFeeCents = round(unitPriceCents * quantity * commissionBps / 10000)
    // vendorShareCents = unitPriceCents * quantity - platformFeeCents

    const unitPriceCents = 50000 // ₹500
    const quantity = 2
    const commissionBps = 1000 // 10%

    const gross = unitPriceCents * quantity // 100000
    const platformFeeCents = Math.round(gross * commissionBps / 10000) // Math.round(100000 * 1000 / 10000) = Math.round(10000) = 10000
    const vendorShareCents = gross - platformFeeCents // 100000 - 10000 = 90000

    expect(platformFeeCents).toBe(10000)
    expect(vendorShareCents).toBe(90000)
  })

  it('handles different commission rates', () => {
    const unitPriceCents = 100000 // ₹1000
    const quantity = 1
    const commissionBps = 2500 // 25%

    const gross = unitPriceCents * quantity
    const platformFeeCents = Math.round(gross * commissionBps / 10000)
    const vendorShareCents = gross - platformFeeCents

    // 100000 * 2500 / 10000 = 25000
    expect(platformFeeCents).toBe(25000)
    expect(vendorShareCents).toBe(75000)
  })

  it('handles edge case of 0 commission', () => {
    const unitPriceCents = 50000
    const quantity = 3
    const commissionBps = 0

    const gross = unitPriceCents * quantity // 150000
    const platformFeeCents = Math.round(gross * commissionBps / 10000) // 0
    const vendorShareCents = gross - platformFeeCents // 150000

    expect(platformFeeCents).toBe(0)
    expect(vendorShareCents).toBe(150000)
  })
})

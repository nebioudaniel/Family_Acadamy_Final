// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'dnebiou@gmail.com'
  const password = 'neba123123' 
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log(`🌱 Seeding admin user...`)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { hashedPassword },
    create: {
      id: 'usr_admin_default', 
      email: adminEmail,
      name: 'Site Administrator',
      role: 'ADMIN',
      hashedPassword,
    },
  })

  console.log(`✅ Admin user ready!`)
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${password}`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

CREATE TABLE "User" ("id" SERIAL NOT NULL, "username" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "avatar" TEXT, "role" "Role" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "banned" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "RegistrationAudit" ("id" SERIAL NOT NULL, "userId" INTEGER NOT NULL, "username" TEXT NOT NULL, "email" TEXT NOT NULL, "ip" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RegistrationAudit_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Post" ("id" SERIAL NOT NULL, "userId" INTEGER NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "whatsappUrl" TEXT NOT NULL, "categoryId" INTEGER NOT NULL, "image" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Post_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Like" ("id" SERIAL NOT NULL, "userId" INTEGER NOT NULL, "postId" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Like_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Comment" ("id" SERIAL NOT NULL, "userId" INTEGER NOT NULL, "postId" INTEGER NOT NULL, "content" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Category" ("id" SERIAL NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Report" ("id" SERIAL NOT NULL, "userId" INTEGER NOT NULL, "postId" INTEGER NOT NULL, "reason" TEXT NOT NULL, "status" "ReportStatus" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Report_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Session" ("id" TEXT NOT NULL, "userId" INTEGER NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "remember" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "Session_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SecurityLog" ("id" SERIAL NOT NULL, "userId" INTEGER, "username" TEXT, "ip" TEXT, "userAgent" TEXT, "country" TEXT, "city" TEXT, "event" TEXT NOT NULL, "success" BOOLEAN NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ContactMessage" ("id" SERIAL NOT NULL, "userId" INTEGER, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "message" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "RegistrationAudit_createdAt_idx" ON "RegistrationAudit"("createdAt");
CREATE INDEX "RegistrationAudit_ip_createdAt_idx" ON "RegistrationAudit"("ip", "createdAt");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

ALTER TABLE "RegistrationAudit" ADD CONSTRAINT "RegistrationAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

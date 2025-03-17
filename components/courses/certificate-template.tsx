"use client"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { Download, Share2 } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface CertificateTemplateProps {
  studentName: string
  courseName: string
  instructorName: string
  completionDate: Date
  certificateId: string
  logoUrl?: string
  signatureUrl?: string
  theme?: "default" | "modern" | "classic" | "minimal"
}

export function CertificateTemplate({
  studentName,
  courseName,
  instructorName,
  completionDate,
  certificateId,
  logoUrl = "/placeholder.svg?height=60&width=200&text=EduLearn",
  signatureUrl = "/placeholder.svg?height=40&width=150&text=Signature",
  theme = "default",
}: CertificateTemplateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  const formattedDate = format(completionDate, "MMMM d, yyyy")

  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case "modern":
        return {
          bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          borderColor: "border-blue-200 dark:border-blue-800",
          accentColor: "text-blue-600 dark:text-blue-400",
          headerBg: "bg-blue-600 dark:bg-blue-800",
        }
      case "classic":
        return {
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          accentColor: "text-amber-600 dark:text-amber-400",
          headerBg: "bg-amber-600 dark:bg-amber-800",
        }
      case "minimal":
        return {
          bgColor: "bg-white dark:bg-black",
          borderColor: "border-gray-200 dark:border-gray-800",
          accentColor: "text-gray-600 dark:text-gray-400",
          headerBg: "bg-gray-100 dark:bg-gray-900",
        }
      default:
        return {
          bgColor: "bg-gradient-to-br from-primary/5 to-primary/10",
          borderColor: "border-primary/20",
          accentColor: "text-primary",
          headerBg: "bg-primary",
        }
    }
  }

  const themeStyles = getThemeStyles()

  // Generate QR code URL for verification
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate?id=${certificateId}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`

  const handleDownload = async () => {
    if (!certificateRef.current) return

    setIsGenerating(true)

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = (pdfHeight - imgHeight * ratio) / 2

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${studentName.replace(/\s+/g, "_")}_Certificate.pdf`)

      toast({
        title: "Certificate downloaded",
        description: "Your certificate has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error generating your certificate. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (!certificateRef.current) return

    setIsGenerating(true)

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob")
        }

        const file = new File([blob], "certificate.png", { type: "image/png" })

        if (navigator.share) {
          await navigator.share({
            title: `${studentName}'s Certificate of Completion`,
            text: `I've completed the "${courseName}" course on EduLearn!`,
            files: [file],
          })

          toast({
            title: "Certificate shared",
            description: "Your certificate has been shared successfully.",
          })
        } else {
          // Fallback if Web Share API is not available
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${studentName.replace(/\s+/g, "_")}_Certificate.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          toast({
            title: "Certificate downloaded",
            description: "Your certificate has been downloaded as an image.",
          })
        }
      }, "image/png")
    } catch (error) {
      console.error("Error sharing certificate:", error)
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "There was an error sharing your certificate. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        ref={certificateRef}
        className={`p-8 border-4 ${themeStyles.borderColor} ${themeStyles.bgColor} aspect-[1.414/1] w-full max-w-4xl mx-auto`}
      >
        {/* Certificate Header */}
        <div className={`${themeStyles.headerBg} text-white py-2 px-4 mb-6 flex justify-between items-center`}>
          <img src={logoUrl || "/placeholder.svg"} alt="Organization Logo" className="h-10 object-contain" />
          <div className="text-sm font-medium">Certificate ID: {certificateId}</div>
        </div>

        {/* Certificate Content */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-serif">Certificate of Completion</h1>

          <div className="my-8">
            <p className="text-lg mb-2">This is to certify that</p>
            <h2 className={`text-4xl font-bold mb-4 ${themeStyles.accentColor}`}>{studentName}</h2>
            <p className="text-lg mb-6">has successfully completed the course</p>
            <h3 className="text-2xl font-bold mb-2">{courseName}</h3>
            <p className="text-base text-muted-foreground">Instructed by {instructorName}</p>
          </div>

          {/* Decorative Element */}
          <div className="flex items-center justify-center my-6">
            <div className="h-px bg-primary/20 w-1/4"></div>
            <div className="mx-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={themeStyles.accentColor}
              >
                <path d="M12 15L8.5 10L15.5 10L12 15Z" fill="currentColor" />
                <path d="M20 4L4 4L4 20L20 20L20 4Z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="h-px bg-primary/20 w-1/4"></div>
          </div>

          {/* Signature and Date */}
          <div className="flex justify-between items-end pt-8 mt-auto">
            <div className="text-center">
              <div className="text-sm font-medium">{formattedDate}</div>
              <div className="text-xs text-muted-foreground">Date of Completion</div>
            </div>

            <div className="text-center">
              <img src={signatureUrl || "/placeholder.svg"} alt="Instructor Signature" className="h-10 mx-auto mb-2" />
              <div className="text-sm font-medium">{instructorName}</div>
              <div className="text-xs text-muted-foreground">Instructor</div>
            </div>

            <div className="text-center">
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="Verification QR Code"
                className="h-20 w-20 mx-auto mb-2"
              />
              <div className="text-xs text-muted-foreground">Scan to verify</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleDownload} disabled={isGenerating} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? "Generating PDF..." : "Download PDF"}
        </Button>

        <Button onClick={handleShare} disabled={isGenerating} variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          {isGenerating ? "Processing..." : "Share Certificate"}
        </Button>
      </div>
    </div>
  )
}


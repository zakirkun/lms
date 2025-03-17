"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { CertificateTemplate } from "@/components/courses/certificate-template"

export default function CertificateSettingsPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("/placeholder.svg?height=60&width=200&text=EduLearn")
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string>(
    "/placeholder.svg?height=40&width=150&text=Signature",
  )
  const [theme, setTheme] = useState<"default" | "modern" | "classic" | "minimal">("default")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Logo image must be less than 2MB",
      })
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Signature image must be less than 1MB",
      })
      return
    }

    setSignatureFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setSignaturePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would upload the files to storage and save the settings
      // For this example, we'll just show a success message

      // Example of how you would upload files:
      // if (logoFile) {
      //   const { data: logoData, error: logoError } = await supabase.storage
      //     .from('certificate-assets')
      //     .upload(`logo-${Date.now()}.png`, logoFile)
      //
      //   if (logoError) throw logoError
      // }

      // if (signatureFile) {
      //   const { data: signatureData, error: signatureError } = await supabase.storage
      //     .from('certificate-assets')
      //     .upload(`signature-${Date.now()}.png`, signatureFile)
      //
      //   if (signatureError) throw signatureError
      // }

      // Save settings to a settings table
      // const { error: settingsError } = await supabase
      //   .from('settings')
      //   .upsert({
      //     key: 'certificate',
      //     value: {
      //       logoUrl: logoData?.path ? supabase.storage.from('certificate-assets').getPublicUrl(logoData.path).data.publicUrl : logoPreview,
      //       signatureUrl: signatureData?.path ? supabase.storage.from('certificate-assets').getPublicUrl(signatureData.path).data.publicUrl : signaturePreview,
      //       theme
      //     }
      //   })

      // if (settingsError) throw settingsError

      toast({
        title: "Settings saved",
        description: "Certificate settings have been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save certificate settings. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Certificate Settings</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Branding</CardTitle>
                  <CardDescription>Customize the appearance of your certificates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Organization Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-32 overflow-hidden border rounded-md bg-muted flex items-center justify-center">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recommended size: 400x100px. Max 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signature">Instructor Signature</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-32 overflow-hidden border rounded-md bg-muted flex items-center justify-center">
                        <img
                          src={signaturePreview || "/placeholder.svg"}
                          alt="Signature preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          id="signature"
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureChange}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recommended size: 300x100px. Max 1MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Certificate Theme</Label>
                    <RadioGroup
                      value={theme}
                      onValueChange={(value) => setTheme(value as any)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="default" id="theme-default" className="peer sr-only" />
                        <Label
                          htmlFor="theme-default"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Default
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="modern" id="theme-modern" className="peer sr-only" />
                        <Label
                          htmlFor="theme-modern"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Modern
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="classic" id="theme-classic" className="peer sr-only" />
                        <Label
                          htmlFor="theme-classic"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Classic
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="minimal" id="theme-minimal" className="peer sr-only" />
                        <Label
                          htmlFor="theme-minimal"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Minimal
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Certificate Preview</CardTitle>
                <CardDescription>This is how your certificates will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 overflow-hidden">
                  <CertificateTemplate
                    studentName="John Doe"
                    courseName="Web Development Masterclass"
                    instructorName="Jane Smith"
                    completionDate={new Date()}
                    certificateId="CERT-12345678-87654321"
                    logoUrl={logoPreview}
                    signatureUrl={signaturePreview}
                    theme={theme}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


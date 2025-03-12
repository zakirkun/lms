import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Users, ArrowRight, Star, CheckCircle } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { Badge } from "@/components/ui/badge"

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  // Get session for conditional rendering
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get featured courses
  const { data: featuredCourses } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      thumbnail_url,
      price,
      profiles (full_name)
    `)
    .eq("is_published", true)
    .order("students_count", { ascending: false })
    .limit(3)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 hero-gradient overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-30"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Badge variant="outline" className="inline-flex mb-2 text-sm animate-slide-in-left">
                    <Star className="mr-1 h-3 w-3 fill-primary text-primary" /> Trusted by 50,000+ students
                  </Badge>
                  <h1 className="display-text gradient-text animate-slide-in-left">Learn Without Limits</h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl animate-slide-in-left animate-delay-100">
                    Access high-quality courses from expert instructors. Master new skills and advance your career at
                    your own pace.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-slide-in-left animate-delay-200">
                  <Button size="lg" asChild className="btn-hover-effect">
                    <Link href="/courses">
                      Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register">Sign Up Free</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-4 animate-slide-in-left animate-delay-300">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="inline-block h-8 w-8 rounded-full bg-muted ring-2 ring-background overflow-hidden"
                      >
                        <img
                          src={`/placeholder.svg?height=32&width=32&text=${i}`}
                          alt={`User ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Join <span className="font-medium text-foreground">2,000+</span> learners this month
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end animate-scale-up animate-delay-200">
                <div className="relative">
                  <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
                  <div className="relative rounded-lg overflow-hidden border shadow-xl">
                    <img
                      src="/placeholder.svg?height=500&width=700"
                      alt="Learning illustration"
                      className="rounded-lg object-cover"
                      width={600}
                      height={400}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <Badge variant="outline" className="inline-flex mb-2">
                  Why Choose EduLearn
                </Badge>
                <h2 className="heading-text">A Learning Experience Like No Other</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a comprehensive learning experience with expert-led courses and interactive
                  content.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm card-hover animate-fade-in">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Diverse Courses</h3>
                <p className="text-center text-muted-foreground">
                  Explore a wide range of subjects taught by industry experts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm card-hover animate-fade-in animate-delay-100">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community Learning</h3>
                <p className="text-center text-muted-foreground">
                  Connect with peers and instructors for a collaborative learning experience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm card-hover animate-fade-in animate-delay-200">
                <div className="rounded-full bg-primary/10 p-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Certificates</h3>
                <p className="text-center text-muted-foreground">
                  Earn recognized certificates to showcase your achievements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <Badge variant="outline" className="inline-flex mb-2">
                  Featured Courses
                </Badge>
                <h2 className="heading-text">Top-Rated Courses</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover our most popular courses loved by thousands of students.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {featuredCourses && featuredCourses.length > 0
                ? featuredCourses.map((course, index) => (
                    <Link
                      href={`/courses/${course.id}`}
                      key={course.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col overflow-hidden rounded-lg border shadow-sm card-hover h-full">
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={course.thumbnail_url || "/placeholder.svg?height=225&width=400"}
                            alt={course.title}
                            className="h-full w-full object-cover transition-all group-hover:scale-105"
                            width={400}
                            height={225}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5 p-6 flex-1">
                          <h3 className="line-clamp-2 font-semibold group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{course.profiles.full_name}</p>
                          <div className="flex items-center pt-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">(120)</span>
                          </div>
                          <div className="pt-2 font-medium mt-auto">
                            {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                : [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col overflow-hidden rounded-lg border shadow-sm animate-fade-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={`/placeholder.svg?height=225&width=400&text=Course+${i}`}
                          alt={`Course ${i}`}
                          className="h-full w-full object-cover"
                          width={400}
                          height={225}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold">Web Development Fundamentals</h3>
                        <p className="text-sm text-muted-foreground">John Doe</p>
                        <div className="flex items-center pt-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-muted-foreground">(120)</span>
                        </div>
                        <div className="pt-2 font-medium">$49.99</div>
                      </div>
                    </div>
                  ))}
            </div>
            <div className="flex justify-center animate-fade-in animate-delay-300">
              <Button size="lg" variant="outline" asChild className="group">
                <Link href="/courses" className="flex items-center">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="inline-flex mb-2">
                    Benefits
                  </Badge>
                  <h2 className="heading-text">Why Our Students Love Us</h2>
                  <p className="text-muted-foreground md:text-lg">
                    We're committed to providing the best learning experience possible. Here's what sets us apart:
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Expert Instructors</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn from industry professionals with real-world experience.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Flexible Learning</h3>
                      <p className="text-sm text-muted-foreground">Study at your own pace, anywhere and anytime.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Interactive Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Engage with quizzes, projects, and hands-on exercises.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Community Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with fellow learners and get help when you need it.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -right-4 -bottom-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
                <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src="/placeholder.svg?height=300&width=300"
                      alt="Student learning"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden rounded-lg mt-8">
                    <img
                      src="/placeholder.svg?height=300&width=300"
                      alt="Online education"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src="/placeholder.svg?height=300&width=300"
                      alt="Collaboration"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden rounded-lg mt-8">
                    <img
                      src="/placeholder.svg?height=300&width=300"
                      alt="Achievement"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <Badge variant="outline" className="inline-flex mb-2">
                  Testimonials
                </Badge>
                <h2 className="heading-text">What Our Students Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from our students about their learning experience with EduLearn.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-lg border p-6 shadow-sm card-hover animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=48&width=48&text=${i}`}
                        alt={`Student ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">Web Development Student</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "The courses on EduLearn have been instrumental in my career transition. The instructors are
                    knowledgeable and the content is up-to-date with industry standards."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <Badge variant="outline" className="inline-flex mb-2">
                  Get Started Today
                </Badge>
                <h2 className="heading-text">Ready to Start Your Learning Journey?</h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Join thousands of students already learning on EduLearn. Start your journey today with our wide range
                  of courses.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center pt-4">
                  <Button size="lg" asChild className="btn-hover-effect">
                    <Link href="/courses">
                      Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center space-y-2 p-4 animate-fade-in">
                <div className="text-3xl font-bold gradient-text">50K+</div>
                <p className="text-center text-sm text-muted-foreground">Students</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 p-4 animate-fade-in animate-delay-100">
                <div className="text-3xl font-bold gradient-text">200+</div>
                <p className="text-center text-sm text-muted-foreground">Courses</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 p-4 animate-fade-in animate-delay-200">
                <div className="text-3xl font-bold gradient-text">50+</div>
                <p className="text-center text-sm text-muted-foreground">Instructors</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 p-4 animate-fade-in animate-delay-300">
                <div className="text-3xl font-bold gradient-text">4.8</div>
                <p className="text-center text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}


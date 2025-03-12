import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Search, SlidersHorizontal } from "lucide-react"
import { CourseCard } from "@/components/courses/course-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get all published courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      profiles (full_name)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get session for conditional rendering
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />

      <main className="flex-1">
        <section className="bg-muted/30 py-12 hero-gradient">
          <div className="container">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in">
              <Badge variant="outline" className="mb-2">
                Find Your Perfect Course
              </Badge>
              <h1 className="heading-text">Explore Our Courses</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Discover a wide range of courses taught by expert instructors to help you achieve your goals.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Desktop Filters */}
              <div className="hidden lg:block animate-slide-in-left">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Filters</h3>
                    <div className="space-y-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="category">
                          <AccordionTrigger>Category</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="web-dev" />
                                <label
                                  htmlFor="web-dev"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Web Development
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="data-science" />
                                <label
                                  htmlFor="data-science"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Data Science
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="mobile-dev" />
                                <label
                                  htmlFor="mobile-dev"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Mobile Development
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="business" />
                                <label
                                  htmlFor="business"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Business
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="price">
                          <AccordionTrigger>Price</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="free" />
                                <label
                                  htmlFor="free"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Free
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="paid" />
                                <label
                                  htmlFor="paid"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Paid
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="level">
                          <AccordionTrigger>Level</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="beginner" />
                                <label
                                  htmlFor="beginner"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Beginner
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="intermediate" />
                                <label
                                  htmlFor="intermediate"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Intermediate
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="advanced" />
                                <label
                                  htmlFor="advanced"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Advanced
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6 animate-fade-in">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search courses..." className="w-full pl-8 focus-ring" />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block">
                      <Select defaultValue="newest">
                        <SelectTrigger className="w-[180px] focus-ring">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden focus-ring">
                          <SlidersHorizontal className="h-4 w-4" />
                          <span className="sr-only">Filter courses</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right">
                        <SheetHeader>
                          <SheetTitle>Filter Courses</SheetTitle>
                          <SheetDescription>Refine your course search results</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Sort by</h3>
                            <Select defaultValue="newest">
                              <SelectTrigger className="focus-ring">
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="category">
                              <AccordionTrigger>Category</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-web-dev" />
                                    <label
                                      htmlFor="mobile-web-dev"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Web Development
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-data-science" />
                                    <label
                                      htmlFor="mobile-data-science"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Data Science
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-mobile-dev" />
                                    <label
                                      htmlFor="mobile-mobile-dev"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Mobile Development
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-business" />
                                    <label
                                      htmlFor="mobile-business"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Business
                                    </label>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="price">
                              <AccordionTrigger>Price</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-free" />
                                    <label
                                      htmlFor="mobile-free"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Free
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-paid" />
                                    <label
                                      htmlFor="mobile-paid"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Paid
                                    </label>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="level">
                              <AccordionTrigger>Level</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-beginner" />
                                    <label
                                      htmlFor="mobile-beginner"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Beginner
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-intermediate" />
                                    <label
                                      htmlFor="mobile-intermediate"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Intermediate
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="mobile-advanced" />
                                    <label
                                      htmlFor="mobile-advanced"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Advanced
                                    </label>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          <Button className="w-full btn-hover-effect">Apply Filters</Button>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button type="submit" className="btn-hover-effect">
                      Search
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses && courses.length > 0 ? (
                    courses.map((course, index) => (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        thumbnailUrl={course.thumbnail_url}
                        instructorName={course.profiles.full_name}
                        duration={course.duration || "2 hours"}
                        studentsCount={course.students_count || 0}
                        price={course.price || 0}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      />
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed py-12 animate-fade-in">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Search className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">No courses available yet</p>
                        <p className="text-sm text-muted-foreground">Check back soon for new courses</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}


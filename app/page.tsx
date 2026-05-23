"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Check,
  Search,
  BookMarked,
  Layers,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  XCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans antialiased text-foreground selection:bg-foreground selection:text-background relative">

      {/* Stark, Precise Geometric Header */}
      <header className="w-full border-b border-foreground flex justify-between items-center px-6 md:px-8 lg:px-12 h-20 bg-background relative z-40">
        <div className="flex items-center gap-6">
          <a href="#" className="font-display font-extrabold tracking-tighter text-xl uppercase flex items-center gap-2">
            <span className="bg-foreground text-background px-2.5 py-0.5 text-sm font-bold">MLN</span>
            <span className="hidden sm:inline tracking-widest text-xs font-normal">FPT Portal</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 border-l border-foreground/20 pl-6 h-6 text-xs tracking-widest uppercase">
            <a href="#syllabus-section" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground">Syllabus</a>
            <a href="#features-section" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground">Features</a>
            <a href="#faq-section" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground">FAQ</a>
          </nav>
        </div>

        <div className="flex items-center gap-4 h-full">
          <ModeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs tracking-widest uppercase px-4 h-10 border border-foreground hover:bg-foreground hover:text-background transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-xs tracking-widest uppercase bg-foreground text-background px-4 h-10 hover:bg-background hover:text-foreground hover:border hover:border-foreground transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2">
                Register
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "rounded-none border border-foreground size-8",
                  userButtonTrigger: "rounded-none focus-visible:outline-3 focus-visible:outline-offset-2"
                }
              }}
            />
          </Show>
        </div>
      </header>

      {/* 4px Heavy Horizontal Ruler separating header from layout */}
      <div className="w-full h-1 bg-foreground" />

      {/* HERO SECTION */}
      <section className="relative w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12 pt-24 pb-20 flex flex-col items-center text-center gap-12 overflow-hidden">

        {/* Giant Graphic Background Text (Typography as Graphics) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-[9rem] sm:text-[13rem] md:text-[18rem] uppercase tracking-tighter text-foreground/[0.02] select-none pointer-events-none z-0">
          PHILOSOPHY
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
          {/* Metadata / Super-header in JetBrains Mono */}
          <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground block mb-2">
            [ FPT UNIVERSITY MLN REFERENCE SYSTEM ]
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-foreground leading-[1.1] uppercase">
            Accurate Reference <br />
            <span className="italic font-normal block sm:inline text-5xl sm:text-7xl md:text-8xl uppercase my-2 sm:my-0">mln</span>
            <br className="sm:hidden" /> With Slide Verification
          </h1>

          {/* Bold Choice #2: Hero Decorative Element (Thick line with tiny center bordered square) */}
          <div className="flex items-center gap-4 w-full max-w-xl mx-auto my-4">
            <div className="h-[2px] bg-foreground flex-1" />
            <div className="size-3 border-2 border-foreground shrink-0 rotate-45 bg-background" />
            <div className="h-[2px] bg-foreground flex-1" />
          </div>

          <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
            Easily search and verify Marxist-Leninist theories. Our highly accurate data verification system strictly aligns with the official curriculum of MLN111, MLN122, and MLN131, providing specific chapter, section, and slide references.
          </p>
        </div>

        {/* CTA Buttons in Stark Monochrome style */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Show when="signed-in">
            <a href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-foreground text-background px-8 h-12 hover:bg-background hover:text-foreground hover:border-2 hover:border-foreground transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3">
                Start Interactive Search →
              </button>
            </a>
          </Show>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-foreground text-background px-8 h-12 hover:bg-background hover:text-foreground hover:border-2 hover:border-foreground transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3">
                Start Searching for Free →
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-background text-foreground border-2 border-foreground px-8 h-12 hover:bg-foreground hover:text-background transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      </section>


      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* CORE INTERACTIVE BOT FEATURES SHOWCASE (Hover Inversions) */}
      <section id="features-section" className="w-full bg-muted/30 relative">
        {/* Layered texture overlay */}
        <div className="absolute inset-0 bg-pattern-grid opacity-[0.01] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 relative z-10 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground pb-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">[ PRODUCT CAPABILITIES ]</span>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight uppercase">
                Accurate Search Features
              </h2>
            </div>
            <p className="font-body text-muted-foreground text-sm max-w-sm">
              Streamlined design to help FPT University students search and verify the source of information in the curriculum efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-foreground">
            {/* Feature 1 */}
            <div className="group bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background flex flex-col justify-between min-h-[300px] border-b md:border-b-0 md:border-r border-foreground">
              <div className="flex flex-col gap-6">
                <div className="size-12 border border-foreground flex items-center justify-center bg-background group-hover:bg-foreground transition-colors duration-100">
                  <Search size={22} strokeWidth={1.25} className="text-foreground group-hover:text-background" />
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-tight">Rapid Slide Search</h3>
                <p className="font-body text-sm text-muted-foreground group-hover:text-background/80 leading-relaxed">
                  Search instantly for complex concepts and definitions. Instantly retrieve the exact quote and official slide number within the FPT curriculum.
                </p>
              </div>
              <div className="text-[10px] tracking-widest uppercase pt-6 border-t border-foreground/20 group-hover:border-background/25 flex items-center gap-2">
                [ 01 // SLIDE_SEARCH_ENGINE ] <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background flex flex-col justify-between min-h-[300px] border-b md:border-b-0 md:border-r border-foreground">
              <div className="flex flex-col gap-6">
                <div className="size-12 border border-foreground flex items-center justify-center bg-background group-hover:bg-foreground transition-colors duration-100">
                  <BookMarked size={22} strokeWidth={1.25} className="text-foreground group-hover:text-background" />
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-tight">Precise Slide Citations</h3>
                <p className="font-body text-sm text-muted-foreground group-hover:text-background/80 leading-relaxed">
                  Every explanation is accompanied by specific chapter, section, and slide numbers, ensuring highly reliable and rapid knowledge verification.
                </p>
              </div>
              <div className="text-[10px] tracking-widest uppercase pt-6 border-t border-foreground/20 group-hover:border-background/25 flex items-center gap-2">
                [ 02 // LECTURE_CITATION ] <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background flex flex-col justify-between min-h-[300px]">
              <div className="flex flex-col gap-6">
                <div className="size-12 border border-foreground flex items-center justify-center bg-background group-hover:bg-foreground transition-colors duration-100">
                  <Layers size={22} strokeWidth={1.25} className="text-foreground group-hover:text-background" />
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-tight">Verify & Cross-Reference</h3>
                <p className="font-body text-sm text-muted-foreground group-hover:text-background/80 leading-relaxed">
                  Cross-reference answers immediately with the original learning source. Verify the accuracy of arguments for a comprehensive and precise understanding.
                </p>
              </div>
              <div className="text-[10px] tracking-widest uppercase pt-6 border-t border-foreground/20 group-hover:border-background/25 flex items-center gap-2">
                [ 03 // KNOWLEDGE_VERIFICATION ] <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* CURRICULUM SYLLABUS TABS */}
      <section id="syllabus-section" className="w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 flex flex-col gap-16 relative">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-pattern-lines opacity-[0.01] pointer-events-none" />

        <div className="text-center flex flex-col gap-4 max-w-2xl mx-auto relative z-10">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">[ 3 SUBJECT CODES ]</span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight uppercase">
            MLN Knowledge Search Scope
          </h2>
        </div>

        <Tabs defaultValue="MLN122" className="w-full relative">
          <div className="flex justify-center">
            <TabsList className="flex flex-wrap md:flex-nowrap border border-foreground/20 bg-background p-0 rounded-none w-full max-w-xl h-auto">
              <TabsTrigger
                value="MLN111"
                className="flex-1 py-4 text-xs tracking-widest uppercase rounded-none md:border-b-0 md:border-r border-foreground/20 font-bold cursor-pointer text-center select-none data-[state=active]:bg-foreground/10 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground transition-all duration-200"
              >
                MLN111
              </TabsTrigger>
              <TabsTrigger
                value="MLN122"
                className="flex-1 py-4 text-xs tracking-widest uppercase rounded-none border-b md:border-b-0 md:border-r border-foreground/20 font-bold cursor-pointer text-center select-none data-[state=active]:bg-foreground/10 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground transition-all duration-200"
              >
                MLN122
              </TabsTrigger>
              <TabsTrigger
                value="MLN131"
                className="flex-1 py-4 text-xs tracking-widest uppercase rounded-none font-bold cursor-pointer text-center select-none data-[state=active]:bg-foreground/10 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground transition-all duration-200"
              >
                MLN131
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-12 flex justify-center">

            {/* Chapter 1 Tab Panel */}
            <TabsContent value="MLN111" className="w-full max-w-5xl focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-foreground/20 p-6 md:p-10 bg-background">
                {/* Left Side: Chapter Info */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                    Semester 8
                  </div>

                  <h3 className="font-display font-extrabold text-2xl md:text-3xl text-foreground uppercase tracking-tight">
                    MLN111: Philosophy of Marxism – Leninism
                  </h3>

                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Marxist-Leninist Philosophy provides a system of dialectical materialism and scientific materialist dialectic methodology. This fundamental political theory subject explores the nature of the world, humans, and society.
                  </p>
                </div>

                {/* Right Side: Topics List */}
                <div className="md:col-span-5 flex flex-col justify-start md:pl-8 md:border-l border-foreground/15">
                  <span className="text-[10px] tracking-wider text-foreground font-bold uppercase mb-4 block">
                    CORE SEARCH TOPICS
                  </span>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Definition of Matter & Origin of Consciousness</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">2 Principles & 3 Laws of Dialectics</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">6 Pairs of Basic Dialectical Categories</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Socio-Economic Formations & Historical Materialism</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Chapter 2 Tab Panel */}
            <TabsContent value="MLN122" className="w-full max-w-5xl focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-foreground/20 p-6 md:p-10 bg-background">
                {/* Left Side: Chapter Info */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                    Semester 8
                  </div>

                  <h3 className="font-display font-extrabold text-2xl md:text-3xl text-foreground uppercase tracking-tight">
                    MLN122: Political economics of Marxism – Leninism
                  </h3>

                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Marxist-Leninist Political Economy examines economic laws operating within the capitalist mode of production, the nature of surplus value, and the mechanism of the socialist-oriented market economy in Vietnam.
                  </p>
                </div>

                {/* Right Side: Topics List */}
                <div className="md:col-span-5 flex flex-col justify-start md:pl-8 md:border-l border-foreground/15">
                  <span className="text-[10px] tracking-wider text-foreground font-bold uppercase mb-4 block">
                    CORE SEARCH TOPICS
                  </span>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Commodities, Currency & Market Laws</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Theory of Surplus Value ($M - C - M'$)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Capital Accumulation & Monopolistic Competition</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Socialist-Oriented Market Economy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Chapter 3 Tab Panel */}
            <TabsContent value="MLN131" className="w-full max-w-5xl focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-foreground/20 p-6 md:p-10 bg-background">
                {/* Left Side: Chapter Info */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                    Semester 9
                  </div>

                  <h3 className="font-display font-extrabold text-2xl md:text-3xl text-foreground uppercase tracking-tight">
                    MLN131: Scientific socialism
                  </h3>

                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Scientific Socialism studies the laws and revolutionary path leading to the emergence of the communist socio-economic formation, the historical mission of the working class, and issues concerning religion, nation, and family.
                  </p>
                </div>

                {/* Right Side: Topics List */}
                <div className="md:col-span-5 flex flex-col justify-start md:pl-8 md:border-l border-foreground/15">
                  <span className="text-[10px] tracking-wider text-foreground font-bold uppercase mb-4 block">
                    CORE SEARCH TOPICS
                  </span>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Historical Mission of the Working Class</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Transition Period & Socialist Socio-Economic Formations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">Social-Class Structure & Class Alliance</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/60 mt-0.5">•</span>
                      <span className="font-body text-muted-foreground">National, Religious & Family Issues</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </section>


      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* EDITORIAL PULL QUOTE SECTION (Bold Choice #6) */}
      <section className="bg-muted/10 py-24 md:py-32 relative overflow-hidden">
        {/* Paper layout decorations */}
        <div className="absolute top-8 left-12 text-[10px] text-muted-foreground tracking-widest uppercase">[ STUDENT TESTIMONIALS ]</div>
        <div className="absolute bottom-8 right-12 text-[10px] text-muted-foreground tracking-widest uppercase">// ALUMNI TESTIMONIALS</div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center gap-10">
          {/* Oversized Quote Mark */}
          <div className="font-display text-foreground/[0.08] text-[10rem] sm:text-[14rem] leading-none absolute -top-20 left-12 select-none pointer-events-none">
            “
          </div>

          <blockquote className="text-center relative">
            <p className="font-display italic text-2xl sm:text-4xl text-foreground leading-relaxed">
              Thanks to the precise verification system based on the MLN111 slide materials, I can quickly search and clarify abstract concepts such as matter, consciousness, and dialectical laws. The slide mapping is incredibly accurate and useful!
            </p>
          </blockquote>

          <div className="flex flex-col items-center gap-2">
            <div className="h-[2px] w-12 bg-foreground" />
            <span className="text-xs tracking-widest uppercase font-bold text-foreground">Hoang Nam Khanh</span>
            <span className="text-[10px] tracking-wider text-muted-foreground">K18 Software Engineering, FPT Hoa Lac</span>
          </div>
        </div>
      </section>

      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* FAQ SECTION */}
      <section id="faq-section" className="w-full max-w-4xl mx-auto px-6 md:px-8 py-24 md:py-32 flex flex-col gap-12 relative">
        <div className="text-center flex flex-col gap-4">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">[ HELPDESK FAQ ]</span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-sm font-body text-muted-foreground max-w-md mx-auto leading-relaxed">
            Everything you need to know about the reference support system and accuracy of the course materials.
          </p>
        </div>

        {/* Geometric stark accordion */}
        <Accordion className="w-full border-t-2 border-foreground">

          <AccordionItem value="faq-1" className="border-b border-foreground rounded-none">
            <AccordionTrigger className="text-sm md:text-base font-display font-extrabold uppercase text-foreground hover:no-underline py-5 text-left focus-visible:outline-2 focus-visible:outline-foreground">
              How does this tool guarantee alignment with FPT slides?
            </AccordionTrigger>
            <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-6 pr-4">
              The system is compiled based directly on the official MLN slide repositories (MLN111, MLN122, MLN131) across all campuses of FPT University. All definitions and reference materials are cross-checked and validated against the official textbook from the Ministry of Education and Training.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-b border-foreground rounded-none">
            <AccordionTrigger className="text-sm md:text-base font-display font-extrabold uppercase text-foreground hover:no-underline py-5 text-left focus-visible:outline-2 focus-visible:outline-foreground">
              Can students from all FPT campuses (Hoa Lac, Can Tho, HCM, Da Nang, Quy Nhon) use this together?
            </AccordionTrigger>
            <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-6 pr-4">
              Absolutely! Although the class schedules and syllabus distribution at different campuses might vary slightly, the core concepts and theoretical foundations of Marxist-Leninist subjects across all FPT campuses are completely unified and standardized based on the Ministry's curriculum.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-b border-foreground rounded-none">
            <AccordionTrigger className="text-sm md:text-base font-display font-extrabold uppercase text-foreground hover:no-underline py-5 text-left focus-visible:outline-2 focus-visible:outline-foreground">
              Can I fully rely on these explanations for major essays and research papers?
            </AccordionTrigger>
            <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-6 pr-4">
              The system is designed to provide the most precise research and reference tools. Every response cites official slide references to let you easily cross-verify. For essays or in-depth academic research, this serves as an extremely reliable guidance and reference source.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </section>

      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* FINAL CALL-TO-ACTION (CTA) SECTION (Radial white gradient highlight, dark bg) */}
      <section className="w-full bg-foreground text-background py-24 md:py-32 relative overflow-hidden text-center">
        {/* Radial highlight overlay */}
        <div className="absolute inset-0 bg-pattern-radial-cta opacity-[0.08] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl mx-auto px-6">
          <span className="text-xs tracking-[0.25em] uppercase text-background/60">[ ACCURATE REFERENCE ]</span>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tight leading-none">
            Accurate MLN Reference System
          </h2>

          {/* Visual punctuation line */}
          <div className="h-[2px] w-20 bg-background my-2" />

          <p className="text-sm sm:text-base font-body text-background/70 max-w-xl leading-relaxed">
            High-accuracy reference search system for Marxist-Leninist theory based on FPT study materials. Experience scientific knowledge lookup today.
          </p>

          <div className="mt-4 w-full flex justify-center">
            <Show when="signed-in">
              <a href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-background text-foreground px-8 h-12 hover:bg-transparent hover:text-background hover:border-2 hover:border-background transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3">
                  Start Reference Search →
                </button>
              </a>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-background text-foreground px-8 h-12 hover:bg-transparent hover:text-background hover:border-2 hover:border-background transition-colors duration-100 cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3">
                  Start Searching for Free →
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </section>

      {/* Heavy 4px Horizontal divider between sections */}
      <div className="w-full h-1 bg-foreground" />

      {/* PREMIUM FOOTER */}
      <footer className="w-full bg-background border-t border-foreground py-12 px-6 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-xs tracking-wider text-muted-foreground uppercase">

          <div className="flex items-center gap-4">
            {/* Greyscale Logo matching the monochrome constraints */}
            <div className="relative size-8 border border-foreground/30 bg-background flex items-center justify-center p-0.5 shrink-0 select-none">
              <Image
                src="/fu-logo.png"
                alt="FPT University"
                width={20}
                height={20}
                className="object-contain grayscale brightness-50 dark:brightness-150 contrast-200"
              />
            </div>
            <span className="text-[10px] leading-relaxed max-w-[280px] sm:max-w-none text-left">
              MLN FPT Study Portal © 2026. Made with discipline for FPT University Students.
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] tracking-widest">
            <span className="hover:underline hover:text-foreground cursor-pointer focus-visible:outline focus-visible:outline-1">[ Terms ]</span>
            <span className="hover:underline hover:text-foreground cursor-pointer focus-visible:outline focus-visible:outline-1">[ Privacy ]</span>
            <span className="hover:underline hover:text-foreground cursor-pointer focus-visible:outline focus-visible:outline-1">[ Contact ]</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

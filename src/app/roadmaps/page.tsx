'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { Map, BookOpen, Clock, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  lesson_count: number;
  section_count: number;
}

export default function RoadmapsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ courses: Course[] }>('/courses', { signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (res.ok && res.data?.courses) {
          setCourses(res.data.courses.filter((c: Course) => c.lesson_count > 0));
        }
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        handleApiError(err);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]/50">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-3 text-xs">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-medium">Course Roadmaps</span>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
            <Map className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Course Roadmaps</h1>
            <p className="text-xs text-gray-500 mt-0.5">Pick a course and follow its structured learning path</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No courses with roadmaps available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/learn/${course.slug}/course-roadmap`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-[#1f1f23] bg-[#0f0f11] hover:border-[#2f2f35] hover:bg-[#111113] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                  <Map className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm group-hover:text-[#22c55e] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{course.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-1.5">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.section_count} sections</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lesson_count} lessons</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#22c55e] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

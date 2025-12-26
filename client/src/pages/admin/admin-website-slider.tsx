import React from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { SliderSection } from "@/pages/admin/admin-website";

export default function AdminWebsiteSliderPage() {
  return (
    <AdminLayout title="Hero Slider" description="Homepage hero slides (title, image, CTA, order).">
      <div className="space-y-6">
        <SliderSection />
      </div>
    </AdminLayout>
  );
}

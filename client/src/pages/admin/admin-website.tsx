import React from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, ImageUp, Search, ChevronLeft, ChevronRight } from "lucide-react";

type CmsTab = "slider" | "blogs" | "skills" | "faces" | "plans" | "faq";

async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

function ImageUrlField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const inputId = React.useId();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Please upload an image under 2MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    onChange(dataUrl);
  };

  const looksLikeImage = value.startsWith("data:image") || /^https?:\/\//i.test(value);

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
        <div className="flex items-center gap-2">
          <input id={inputId} type="file" accept="image/*" className="hidden" onChange={onPick} />
          <Button type="button" variant="outline" className="gap-2" onClick={() => document.getElementById(inputId)?.click()}>
            <ImageUp className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>
      {value && looksLikeImage ? (
        <div className="rounded-md border bg-muted/30 p-2">
          <img src={value} alt="preview" className="h-16 w-auto max-w-full rounded object-contain" />
        </div>
      ) : null}
    </div>
  );
}

function useFilterPagination<T>(items: T[], filterText: string, filterFn: (item: T, q: string) => boolean) {
  const q = filterText.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return items;
    return items.filter((i) => filterFn(i, q));
  }, [items, q, filterFn]);

  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [q]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return { q, filtered, paged, page, setPage, pageSize, totalPages };
}

type SliderItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
};

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  body: string;
  status: string;
  publishedAt: string | null;
};

type FeaturedSkill = {
  id: string;
  title: string;
  iconClass: string | null;
  metaText: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
};

type HappyFace = {
  id: string;
  quote: string;
  title: string;
  name: string;
  company: string;
  avatarUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Plan = {
  id: string;
  name: string;
  priceText: string | null;
  subtitle: string | null;
  features: string[];
  sortOrder: number;
  isActive: boolean;
};

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

function useCmsTab(): [CmsTab, (t: CmsTab) => void] {
  const [, setLocation] = useLocation();

  const getTabFromSearch = React.useCallback((search: string): CmsTab => {
    const allowed: CmsTab[] = ["slider", "blogs", "skills", "faces", "plans", "faq"];
    const params = new URLSearchParams((search ?? "").replace(/^\?/, ""));
    const raw = params.get("tab") ?? "slider";
    if (allowed.includes(raw as CmsTab)) return raw as CmsTab;
    return "slider";
  }, []);

  const [currentTab, setCurrentTab] = React.useState<CmsTab>(() => {
    if (typeof window === "undefined") return "slider";
    return getTabFromSearch(window.location.search);
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onUrlChange = () => {
      setCurrentTab(getTabFromSearch(window.location.search));
    };

    const w = window as any;
    if (!w.__findternHistoryPatched) {
      w.__findternHistoryPatched = true;
      const origPushState = history.pushState.bind(history);
      const origReplaceState = history.replaceState.bind(history);

      history.pushState = ((...args: Parameters<History["pushState"]>) => {
        const ret = origPushState(...args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      }) as History["pushState"];

      history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
        const ret = origReplaceState(...args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      }) as History["replaceState"];
    }

    window.addEventListener("popstate", onUrlChange);
    window.addEventListener("hashchange", onUrlChange);
    window.addEventListener("locationchange", onUrlChange as any);
    onUrlChange();

    return () => {
      window.removeEventListener("popstate", onUrlChange);
      window.removeEventListener("hashchange", onUrlChange);
      window.removeEventListener("locationchange", onUrlChange as any);
    };
  }, [getTabFromSearch]);

  const setTab = (next: CmsTab) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    setLocation(url.pathname + url.search);
    setCurrentTab(next);
  };

  return [currentTab, setTab];
}

function SectionShell({
  title,
  description,
  onAdd,
  children,
}: {
  title: string;
  description?: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-sm">
      <div className="flex flex-col gap-3 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-[#0E6049]">{title}</div>
          {description ? (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          ) : null}
        </div>
        {onAdd ? (
          <Button className="bg-[#0E6049] hover:bg-[#0b4b3a]" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        ) : null}
      </div>
      <div className="px-4 py-4">{children}</div>
    </Card>
  );
}

export function SliderSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SliderItem | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaHref: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery<{ items: SliderItem[] }>({
    queryKey: ["/api/admin/website/slider"],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/slider", {
        ...payload,
        subtitle: payload.subtitle || null,
        imageUrl: payload.imageUrl || null,
        ctaText: payload.ctaText || null,
        ctaHref: payload.ctaHref || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/slider"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/slider/${id}`, {
        ...payload,
        subtitle: payload.subtitle || null,
        imageUrl: payload.imageUrl || null,
        ctaText: payload.ctaText || null,
        ctaHref: payload.ctaHref || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/slider"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/slider/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/slider"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      ctaText: "",
      ctaHref: "",
      sortOrder: 0,
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (item: SliderItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle ?? "",
      imageUrl: item.imageUrl ?? "",
      ctaText: item.ctaText ?? "",
      ctaHref: item.ctaHref ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const items = data?.items ?? [];
  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    items,
    filterText,
    (item, q) => {
      const s = item as SliderItem;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.subtitle ?? "").toLowerCase().includes(q) ||
        (s.ctaText ?? "").toLowerCase().includes(q) ||
        (s.ctaHref ?? "").toLowerCase().includes(q)
      );
    },
  );

  return (
    <SectionShell
      title="Slider"
      description="Homepage hero slider items"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Slide" : "Add Slide"}</DialogTitle>
            <DialogDescription>
              Manage slider items (title, subtitle, image, CTA, order, visibility).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Title</div>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Subtitle</div>
              <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <ImageUrlField
                label="Image URL"
                value={form.imageUrl}
                onChange={(next) => setForm((p) => ({ ...p, imageUrl: next }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">CTA Text</div>
                <Input value={form.ctaText} onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">CTA Link</div>
                <Input value={form.ctaHref} onChange={(e) => setForm((p) => ({ ...p, ctaHref: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Active</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
            </div>
          </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#0E6049] hover:bg-[#0b4b3a]"
            onClick={submit}
            disabled={createMutation.isPending || updateMutation.isPending || !form.title.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div className="flex flex-col gap-3 px-1 pb-2 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-[420px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Search slides..."
          className="pl-9"
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {filtered.length} result(s)
      </div>
    </div>

    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No slides yet.
              </TableCell>
            </TableRow>
          ) : (
            paged.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    <div className="flex items-center justify-end gap-2 pt-3">
      <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-xs text-muted-foreground">
        Page {page} / {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </SectionShell>
);
}

export function BlogsSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlogPost | null>(null);
  const [form, setForm] = React.useState({
    slug: "",
    title: "",
    excerpt: "",
    coverImageUrl: "",
    bannerImageUrl: "",
    body: "",
    status: "draft",
  });

  const { data, isLoading } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/admin/website/blogs"],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/blogs", {
        ...payload,
        excerpt: payload.excerpt || null,
        coverImageUrl: payload.coverImageUrl || null,
        bannerImageUrl: payload.bannerImageUrl || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/blogs"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/blogs/${id}`, {
        ...payload,
        excerpt: payload.excerpt || null,
        coverImageUrl: payload.coverImageUrl || null,
        bannerImageUrl: payload.bannerImageUrl || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/blogs"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/blogs/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/blogs"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ slug: "", title: "", excerpt: "", coverImageUrl: "", bannerImageUrl: "", body: "", status: "draft" });
    setOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      bannerImageUrl: post.bannerImageUrl ?? "",
      body: post.body,
      status: post.status,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const posts = data?.posts ?? [];
  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    posts,
    filterText,
    (post, q) => {
      const p = post as BlogPost;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    },
  );

  const insertIntoBody = (url: string) => {
    if (!url) return;
    setForm((p) => ({
      ...p,
      body: `${p.body}${p.body.trim() ? "\n\n" : ""}${url}\n`,
    }));
  };

  return (
    <SectionShell
      title="Blogs"
      description="Create and publish website blog posts"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[820px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Blog" : "Add Blog"}</DialogTitle>
            <DialogDescription>
              Slug must be unique (example: hiring-interns-2026). Published posts will show on website.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Slug</div>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Status</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Title</div>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Excerpt</div>
              <Textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <ImageUrlField
                label="Cover Image URL"
                value={form.coverImageUrl}
                onChange={(next) => setForm((p) => ({ ...p, coverImageUrl: next }))}
              />
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => insertIntoBody(form.coverImageUrl)}>
                  Insert into Body
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <ImageUrlField
                label="Banner Image URL"
                value={form.bannerImageUrl}
                onChange={(next) => setForm((p) => ({ ...p, bannerImageUrl: next }))}
              />
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => insertIntoBody(form.bannerImageUrl)}>
                  Insert into Body
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Body</div>
              <Textarea
                className="min-h-[220px]"
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0E6049] hover:bg-[#0b4b3a]"
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.slug.trim() || !form.title.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search blogs..."
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} result(s)</div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No blog posts.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.slug}</TableCell>
                  <TableCell>{post.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(post.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionShell>
  );
}

function FeaturedSkillsSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FeaturedSkill | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    iconClass: "",
    metaText: "",
    href: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery<{ items: FeaturedSkill[] }>({
    queryKey: ["/api/admin/website/skills"],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/skills", {
        ...payload,
        iconClass: payload.iconClass || null,
        metaText: payload.metaText || null,
        href: payload.href || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/skills"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/skills/${id}`, {
        ...payload,
        iconClass: payload.iconClass || null,
        metaText: payload.metaText || null,
        href: payload.href || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/skills"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/skills/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/skills"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", iconClass: "", metaText: "", href: "", sortOrder: 0, isActive: true });
    setOpen(true);
  };

  const openEdit = (item: FeaturedSkill) => {
    setEditing(item);
    setForm({
      title: item.title,
      iconClass: item.iconClass ?? "",
      metaText: item.metaText ?? "",
      href: item.href ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const items = data?.items ?? [];

  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    items,
    filterText,
    (item, q) => {
      const s = item as FeaturedSkill;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.iconClass ?? "").toLowerCase().includes(q) ||
        (s.metaText ?? "").toLowerCase().includes(q) ||
        (s.href ?? "").toLowerCase().includes(q)
      );
    },
  );

  return (
    <SectionShell
      title="Featured Skills"
      description="Cards shown on website homepage"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>Manage homepage skill cards (title, icon class, meta text, link, order).</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Title</div>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Icon Class</div>
                <Input value={form.iconClass} onChange={(e) => setForm((p) => ({ ...p, iconClass: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Meta Text</div>
                <Input value={form.metaText} onChange={(e) => setForm((p) => ({ ...p, metaText: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Link (href)</div>
              <Input value={form.href} onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Active</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0E6049] hover:bg-[#0b4b3a]"
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.title.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search testimonials..."
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} result(s)</div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No skills yet.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionShell>
  );
}

function HappyFacesSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HappyFace | null>(null);
  const [form, setForm] = React.useState({
    quote: "",
    title: "",
    name: "",
    company: "",
    avatarUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery<{ items: HappyFace[] }>({
    queryKey: ["/api/admin/website/faces"],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/faces", {
        ...payload,
        avatarUrl: payload.avatarUrl || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faces"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/faces/${id}`, {
        ...payload,
        avatarUrl: payload.avatarUrl || null,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faces"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/faces/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faces"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      quote: "",
      title: "",
      name: "",
      company: "",
      avatarUrl: "",
      sortOrder: 0,
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (item: HappyFace) => {
    setEditing(item);
    setForm({
      quote: item.quote,
      title: item.title,
      name: item.name,
      company: item.company,
      avatarUrl: item.avatarUrl ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const items = data?.items ?? [];

  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    items,
    filterText,
    (item, q) => {
      const t = item as HappyFace;
      return (
        t.quote.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q)
      );
    },
  );

  return (
    <SectionShell
      title="Happy Faces"
      description="Testimonials section for website"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>Manage testimonials (quote, person, company, avatar, order).</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Quote</div>
              <Textarea value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Title</div>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <ImageUrlField
                  label="Avatar URL"
                  value={form.avatarUrl}
                  onChange={(next) => setForm((p) => ({ ...p, avatarUrl: next }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Name</div>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Company</div>
                <Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Active</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0E6049] hover:bg-[#0b4b3a]"
              onClick={submit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !form.quote.trim() ||
                !form.title.trim() ||
                !form.name.trim() ||
                !form.company.trim()
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 px-1 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search testimonials..."
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} result(s)</div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No testimonials yet.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionShell>
  );
}

function PlansSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Plan | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    priceText: "",
    subtitle: "",
    featuresText: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery<{ items: Plan[] }>({
    queryKey: ["/api/admin/website/plans"],
  });

  const parseFeatures = (text: string) => {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/plans", {
        name: payload.name,
        priceText: payload.priceText || null,
        subtitle: payload.subtitle || null,
        features: parseFeatures(payload.featuresText),
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/plans"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/plans/${id}`, {
        name: payload.name,
        priceText: payload.priceText || null,
        subtitle: payload.subtitle || null,
        features: parseFeatures(payload.featuresText),
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
      });
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/plans"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/plans/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/plans"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      priceText: "",
      subtitle: "",
      featuresText: "",
      sortOrder: 0,
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (item: Plan) => {
    setEditing(item);
    setForm({
      name: item.name,
      priceText: item.priceText ?? "",
      subtitle: item.subtitle ?? "",
      featuresText: (item.features ?? []).join("\n"),
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const items = data?.items ?? [];

  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    items,
    filterText,
    (item, q) => {
      const p = item as Plan;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.priceText ?? "").toLowerCase().includes(q) ||
        (p.subtitle ?? "").toLowerCase().includes(q)
      );
    },
  );

  return (
    <SectionShell
      title="Plans"
      description="Pricing plans shown on website"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>Features: one feature per line.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Name</div>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Price Text</div>
                <Input value={form.priceText} onChange={(e) => setForm((p) => ({ ...p, priceText: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Subtitle</div>
                <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Features</div>
              <Textarea
                className="min-h-[160px]"
                value={form.featuresText}
                onChange={(e) => setForm((p) => ({ ...p, featuresText: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Active</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0E6049] hover:bg-[#0b4b3a]"
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.name.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No plans yet.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.priceText ?? ""}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">Page {page} / {totalPages}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionShell>
  );
}

function FaqSection() {
  const qc = useQueryClient();

  const [filterText, setFilterText] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FaqItem | null>(null);
  const [form, setForm] = React.useState({
    category: "",
    question: "",
    answer: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery<{ items: FaqItem[] }>({
    queryKey: ["/api/admin/website/faq"],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiRequest("POST", "/api/admin/website/faq", payload);
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faq"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof form }) => {
      const res = await apiRequest("PUT", `/api/admin/website/faq/${id}`, payload);
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faq"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/website/faq/${id}`);
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["/api/admin/website/faq"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ category: "", question: "", answer: "", sortOrder: 0, isActive: true });
    setOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({
      category: item.category,
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form);
  };

  const items = data?.items ?? [];

  const { paged, page, setPage, totalPages, filtered } = useFilterPagination(
    items,
    filterText,
    (item, q) => {
      const f = item as FaqItem;
      return (
        f.category.toLowerCase().includes(q) ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    },
  );

  return (
    <SectionShell
      title="FAQ"
      description="Frequently asked questions for website"
      onAdd={openCreate}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>Create FAQ items with category, question, answer, and order.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Category</div>
              <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Question</div>
              <Input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Answer</div>
              <Textarea value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Active</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0E6049] hover:bg-[#0b4b3a]"
              onClick={submit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !form.category.trim() ||
                !form.question.trim() ||
                !form.answer.trim()
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No FAQs yet.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="max-w-[520px] truncate">{item.question}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionShell>
  );
}

export function PlaceholderSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SectionShell title={title} description={subtitle}>
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        Coming next: CRUD UI + DB tables + API endpoints.
      </div>
    </SectionShell>
  );
}

export default function AdminWebsitePage() {
  const [tab] = useCmsTab();

  const content = React.useMemo(() => {
    switch (tab) {
      case "slider":
        return <SliderSection />;
      case "blogs":
        return <BlogsSection />;
      case "skills":
        return <FeaturedSkillsSection />;
      case "faces":
        return <HappyFacesSection />;
      case "plans":
        return <PlansSection />;
      case "faq":
        return <FaqSection />;
      default:
        return <SliderSection />;
    }
  }, [tab]);

  return (
    <AdminLayout
      title="Website CMS"
      description="Manage website content (slider, blogs, skills, testimonials, plans, FAQs)."
    >
      <div className="space-y-6">
        {content}
      </div>
    </AdminLayout>
  );
}

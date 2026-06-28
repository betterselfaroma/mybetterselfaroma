-- Admin CMS for website template content and media.
-- Idempotent: no table drops and no existing row deletion.

create extension if not exists pgcrypto;

create or replace function public.is_staff_or_admin_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.customers c
     where (c.auth_user_id = p_user_id
        or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
       and (
         coalesce(c.is_admin, false) = true
         or coalesce(c.role, 'member') in ('admin', 'staff')
       )
  )
$$;

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  seo_title text,
  seo_description text,
  og_image_url text,
  keywords text,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  section_type text not null,
  title text,
  subtitle text,
  body text,
  image_url text,
  button_text text,
  button_url text,
  data jsonb default '{}'::jsonb,
  sort_order integer default 0,
  visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(page_slug, section_key)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text,
  file_path text,
  public_url text,
  alt_text text,
  mime_type text,
  size_bytes integer,
  uploaded_by uuid,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.site_pages
  add column if not exists keywords text,
  add column if not exists updated_at timestamptz default now();

alter table public.page_sections
  add column if not exists image_url text,
  add column if not exists button_text text,
  add column if not exists button_url text,
  add column if not exists data jsonb default '{}'::jsonb,
  add column if not exists sort_order integer default 0,
  add column if not exists visible boolean default true,
  add column if not exists updated_at timestamptz default now();

create index if not exists page_sections_page_sort_idx
  on public.page_sections(page_slug, sort_order, section_key);

create index if not exists media_assets_created_idx
  on public.media_assets(created_at desc);

-- ---------------------------------------------------------------------------
-- Storage bucket and policies.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
   set public = true,
       file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists site_media_public_read on storage.objects;
create policy site_media_public_read on storage.objects
  for select
  using (bucket_id = 'site-media');

drop policy if exists site_media_staff_insert on storage.objects;
create policy site_media_staff_insert on storage.objects
  for insert
  with check (bucket_id = 'site-media' and public.is_staff_or_admin_user());

drop policy if exists site_media_staff_update on storage.objects;
create policy site_media_staff_update on storage.objects
  for update
  using (bucket_id = 'site-media' and public.is_staff_or_admin_user())
  with check (bucket_id = 'site-media' and public.is_staff_or_admin_user());

drop policy if exists site_media_staff_delete on storage.objects;
create policy site_media_staff_delete on storage.objects
  for delete
  using (bucket_id = 'site-media' and public.is_staff_or_admin_user());

-- ---------------------------------------------------------------------------
-- RLS.
-- ---------------------------------------------------------------------------
alter table public.site_pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists site_pages_public_select on public.site_pages;
create policy site_pages_public_select on public.site_pages
  for select
  using (published = true or public.is_staff_or_admin_user());

drop policy if exists site_pages_staff_all on public.site_pages;
create policy site_pages_staff_all on public.site_pages
  for all
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists page_sections_public_select on public.page_sections;
create policy page_sections_public_select on public.page_sections
  for select
  using (visible = true or public.is_staff_or_admin_user());

drop policy if exists page_sections_staff_all on public.page_sections;
create policy page_sections_staff_all on public.page_sections
  for all
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists media_assets_public_select on public.media_assets;
create policy media_assets_public_select on public.media_assets
  for select
  using (true);

drop policy if exists media_assets_staff_all on public.media_assets;
create policy media_assets_staff_all on public.media_assets
  for all
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select on public.site_settings
  for select
  using (true);

drop policy if exists site_settings_staff_all on public.site_settings;
create policy site_settings_staff_all on public.site_settings
  for all
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

-- ---------------------------------------------------------------------------
-- Seed pages and default editable sections.
-- ---------------------------------------------------------------------------
insert into public.site_pages (slug, title, seo_title, seo_description, og_image_url, published)
values
  ('home', 'Home', '香气读懂你的心 · Scent Knows You', '一场温柔的摸香测试，帮助你看见内心真正需要的方向。', '/scent-knows-you-assets/01_homepage_hero_scene.png', true),
  ('about', 'About', 'About · Scent Knows You', '品牌故事与香气体验介绍。', null, true),
  ('services', 'Services', 'Services · Scent Knows You', 'RM60 Scent Test 与 RM150 Custom Blend 体验方案。', null, true),
  ('member', 'Member', 'Member · Scent Knows You', '会员积分、推荐奖励与专属礼遇。', null, true),
  ('booking', 'Booking', 'Booking · Scent Knows You', '预约香气体验。', null, true)
on conflict (slug) do update
   set title = excluded.title,
       seo_title = coalesce(public.site_pages.seo_title, excluded.seo_title),
       seo_description = coalesce(public.site_pages.seo_description, excluded.seo_description),
       og_image_url = coalesce(public.site_pages.og_image_url, excluded.og_image_url),
       updated_at = now();

insert into public.page_sections (
  page_slug, section_key, section_type, title, subtitle, body, image_url, button_text, button_url, data, sort_order, visible
)
values
  (
    'home',
    'hero',
    'hero',
    '测出你内心真正的渴望，看见困住你的烦恼。',
    '解析潜意识最深渴望，引导你找到跨越困境的解方。',
    '通过摸香测试，读懂你当下的内心需求、生活状态与情绪卡点。',
    '/scent-knows-you-assets/01_homepage_hero_scene.png',
    '预约 RM60 摸香测试',
    '#packages',
    '{
      "zh": {
        "eyebrow": "一场 10–30 分钟的温柔体验",
        "titleLines": ["测出你内心真正的渴望，", "看见困住你的烦恼。"],
        "secondaryCta": "了解 RM150 专属调配",
        "safety": "不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。"
      },
      "en": {
        "eyebrow": "A gentle 10–30 minute experience",
        "titleLines": ["Discover what your inner self truly longs for,", "and see what has been holding you back."],
        "subtitle": "Decode your deeper subconscious needs and find a clearer way through.",
        "body": "Through scent testing, we help you understand your current emotional state and personal scent direction.",
        "primaryCta": "Book RM60 Scent Test",
        "secondaryCta": "Explore RM150 Custom Blend",
        "safety": "Not fortune telling or medical diagnosis, but a gentle scent-based self-awareness experience."
      }
    }'::jsonb,
    10,
    true
  ),
  (
    'home',
    'about',
    'about',
    '你会看见什么？',
    'What you will discover',
    '香气测试帮助你看见内心真正的渴望、当下困住你的烦恼，以及适合你的香气方向。',
    '/scent-knows-you-assets/02_what_is_scent_test_section.png',
    null,
    null,
    '{"en":{"title":"What will you discover?","subtitle":"What you will discover","body":"Scent testing helps reveal your inner longing, current emotional blocks, and a scent direction that fits your present state."}}'::jsonb,
    20,
    true
  ),
  (
    'home',
    'services',
    'packages',
    '选择适合你的体验方案',
    'Services',
    'Admin 可编辑 RM60 与 RM150 体验方案名称、价格、说明、图片、排序与显示状态。',
    null,
    null,
    null,
    '{
      "en": {"title":"Choose the experience that fits you","subtitle":"Services"},
      "packages": [
        {"code":"scent_test","name":"摸香状态测试体验","price":"RM60","description":"适合想了解自己当下内心状态、真正渴望与烦恼卡点的人。","image_url":"/scent-knows-you-assets/01_scent_testing_package_visual.png","visible":true,"sort_order":1},
        {"code":"custom_blend","name":"专属调配精油体验","price":"RM150","description":"包含摸香测试与专属滚珠精油调配，把看见自己的方向带回日常。","image_url":"/scent-knows-you-assets/02_custom_ritual_package_visual.png","visible":true,"sort_order":2}
      ]
    }'::jsonb,
    30,
    true
  ),
  (
    'home',
    'membership',
    'membership',
    '会员积分礼遇',
    'Member Points',
    '注册会员后可以累积积分、兑换商品，并获得推荐奖励。',
    null,
    '注册会员',
    '/register',
    '{"en":{"title":"Member Points","subtitle":"Member Benefits","body":"Members can earn points, redeem rewards, and receive referral benefits.","button_text":"Join Member"}}'::jsonb,
    40,
    true
  ),
  (
    'home',
    'referral',
    'referral',
    '会员专属推荐奖励',
    'Referral Rewards',
    '朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。',
    '/scent-knows-you-assets/10_referral_reward_640x520.png',
    '注册会员，立即获取推荐码',
    '/register',
    '{"en":{"title":"Member Referral Rewards","body":"When your friend uses your code and completes their first RM60 or RM150 experience, you receive RM10 TNG PIN and member points.","button_text":"Join Member and Get Your Code"}}'::jsonb,
    50,
    true
  ),
  (
    'home',
    'booking_cta',
    'cta',
    '你现在真正需要的，也许不是一瓶精油，而是一次看见自己的机会。',
    'Final CTA',
    null,
    null,
    '预约 RM60 摸香测试',
    '#packages',
    '{"zh":{"lines":["你现在真正需要的，","也许不是一瓶精油，","而是一次看见自己的机会。"],"secondary":"WhatsApp 咨询我们"},"en":{"lines":["What you truly need right now may not be just a bottle of oil,","but a chance to see yourself more clearly."],"primary":"Book RM60 Scent Test","secondary":"WhatsApp Inquiry"}}'::jsonb,
    90,
    true
  ),
  (
    'home',
    'faq',
    'faq',
    '常见问题',
    'FAQ',
    null,
    null,
    null,
    null,
    '{"items":[{"q":"摸香测试是医疗诊断吗？","a":"不是。它是一场香气觉察体验，帮助你更了解自己的当下状态。"},{"q":"我可以只做 RM60 测试吗？","a":"可以。你也可以在测试后升级 RM150 专属调配。"}],"en":{"title":"FAQ","items":[{"q":"Is scent testing a medical diagnosis?","a":"No. It is a self-awareness experience through scent."},{"q":"Can I choose only the RM60 test?","a":"Yes. You may upgrade to the RM150 custom blend after the test."}]}}'::jsonb,
    100,
    true
  )
on conflict (page_slug, section_key) do update
   set section_type = excluded.section_type,
       title = coalesce(public.page_sections.title, excluded.title),
       subtitle = coalesce(public.page_sections.subtitle, excluded.subtitle),
       body = coalesce(public.page_sections.body, excluded.body),
       image_url = coalesce(public.page_sections.image_url, excluded.image_url),
       button_text = coalesce(public.page_sections.button_text, excluded.button_text),
       button_url = coalesce(public.page_sections.button_url, excluded.button_url),
       data = case
         when public.page_sections.data = '{}'::jsonb then excluded.data
         else public.page_sections.data
       end,
       sort_order = coalesce(public.page_sections.sort_order, excluded.sort_order),
       updated_at = now();

insert into public.site_settings (setting_key, setting_value)
values
  ('brand_name', '{"zh":"香气读懂你的心","en":"Scent Knows You"}'::jsonb),
  ('tagline', '{"zh":"你现在真正需要的，也许不是一瓶精油，而是一次看见自己的机会。","en":"A chance to see yourself more clearly."}'::jsonb),
  ('whatsapp_number', '{"yaning":"0124761919","wenshan":"0177898668"}'::jsonb),
  ('email', '{"value":"scentknowsyou@gmail.com"}'::jsonb),
  ('address', '{"value":""}'::jsonb),
  ('business_hours', '{"value":"By appointment"}'::jsonb),
  ('instagram_url', '{"value":""}'::jsonb),
  ('facebook_url', '{"value":""}'::jsonb),
  ('tiktok_url', '{"value":""}'::jsonb),
  ('default_seo_title', '{"value":"香气读懂你的心 · Scent Knows You"}'::jsonb),
  ('default_seo_description', '{"value":"一场温柔的摸香测试，帮助你看见内心真正需要的方向。"}'::jsonb),
  ('default_og_image', '{"value":"/scent-knows-you-assets/01_homepage_hero_scene.png"}'::jsonb)
on conflict (setting_key) do nothing;

notify pgrst, 'reload schema';

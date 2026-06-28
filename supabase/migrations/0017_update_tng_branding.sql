-- Normalize public-facing Touch 'n Go abbreviation from TNG to TnG.
-- Text-only update. No table drops, no data deletion.

update public.page_sections
   set title = replace(title, 'TNG', 'TnG'),
       subtitle = replace(subtitle, 'TNG', 'TnG'),
       body = replace(body, 'TNG', 'TnG'),
       button_text = replace(button_text, 'TNG', 'TnG'),
       data = replace(data::text, 'TNG', 'TnG')::jsonb,
       updated_at = now()
 where title like '%TNG%'
    or subtitle like '%TNG%'
    or body like '%TNG%'
    or button_text like '%TNG%'
    or data::text like '%TNG%';

update public.site_pages
   set title = replace(title, 'TNG', 'TnG'),
       seo_title = replace(seo_title, 'TNG', 'TnG'),
       seo_description = replace(seo_description, 'TNG', 'TnG'),
       keywords = replace(keywords, 'TNG', 'TnG'),
       updated_at = now()
 where title like '%TNG%'
    or seo_title like '%TNG%'
    or seo_description like '%TNG%'
    or keywords like '%TNG%';

update public.site_settings
   set setting_value = replace(setting_value::text, 'TNG', 'TnG')::jsonb,
       updated_at = now()
 where setting_value::text like '%TNG%';

notify pgrst, 'reload schema';

DROP POLICY IF EXISTS grid_forum_categories_read ON public.grid_forum_categories;
CREATE POLICY grid_forum_categories_public_safe_read ON public.grid_forum_categories
FOR SELECT TO anon USING (content_rating = 'E');
CREATE POLICY grid_forum_categories_age_band_read ON public.grid_forum_categories
FOR SELECT TO authenticated USING (public.grid_age_band_allowed(content_rating));

DROP POLICY IF EXISTS grid_forum_topics_read ON public.grid_forum_topics;
CREATE POLICY grid_forum_topics_public_safe_read ON public.grid_forum_topics
FOR SELECT TO anon USING (
  content_rating = 'E'
  AND EXISTS (SELECT 1 FROM public.grid_forum_categories c WHERE c.id = category_id AND c.content_rating = 'E')
);
CREATE POLICY grid_forum_topics_age_band_read ON public.grid_forum_topics
FOR SELECT TO authenticated USING (
  public.grid_age_band_allowed(content_rating)
  AND EXISTS (SELECT 1 FROM public.grid_forum_categories c WHERE c.id = category_id AND public.grid_age_band_allowed(c.content_rating))
);

DROP POLICY IF EXISTS grid_forum_posts_read ON public.grid_forum_posts;
CREATE POLICY grid_forum_posts_public_safe_read ON public.grid_forum_posts
FOR SELECT TO anon USING (
  content_rating = 'E'
  AND EXISTS (
    SELECT 1 FROM public.grid_forum_topics t
    JOIN public.grid_forum_categories c ON c.id = t.category_id
    WHERE t.id = topic_id AND t.content_rating = 'E' AND c.content_rating = 'E'
  )
);
CREATE POLICY grid_forum_posts_age_band_read ON public.grid_forum_posts
FOR SELECT TO authenticated USING (
  public.grid_age_band_allowed(content_rating)
  AND EXISTS (
    SELECT 1 FROM public.grid_forum_topics t
    JOIN public.grid_forum_categories c ON c.id = t.category_id
    WHERE t.id = topic_id
      AND public.grid_age_band_allowed(t.content_rating)
      AND public.grid_age_band_allowed(c.content_rating)
  )
);

DROP POLICY IF EXISTS grid_forum_topics_insert ON public.grid_forum_topics;
CREATE POLICY grid_forum_topics_insert ON public.grid_forum_topics
FOR INSERT TO authenticated WITH CHECK (
  created_by_user = auth.uid() AND created_by_npc IS NULL
  AND public.grid_age_band_allowed(content_rating)
  AND EXISTS (SELECT 1 FROM public.grid_forum_categories c WHERE c.id = category_id AND public.grid_age_band_allowed(c.content_rating))
);

DROP POLICY IF EXISTS grid_forum_posts_insert ON public.grid_forum_posts;
CREATE POLICY grid_forum_posts_insert ON public.grid_forum_posts
FOR INSERT TO authenticated WITH CHECK (
  author_user = auth.uid() AND author_npc IS NULL
  AND public.grid_age_band_allowed(content_rating)
  AND EXISTS (
    SELECT 1 FROM public.grid_forum_topics t
    JOIN public.grid_forum_categories c ON c.id = t.category_id
    WHERE t.id = topic_id
      AND public.grid_age_band_allowed(t.content_rating)
      AND public.grid_age_band_allowed(c.content_rating)
  )
);

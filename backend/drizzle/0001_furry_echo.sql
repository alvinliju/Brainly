ALTER TABLE "link_tags" DROP CONSTRAINT "id";--> statement-breakpoint
ALTER TABLE "space_links" DROP CONSTRAINT "id";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "link_tags" ADD CONSTRAINT "link_tags_link_Id_tag_Id_pk" PRIMARY KEY("link_Id","tag_Id");--> statement-breakpoint
ALTER TABLE "space_links" ADD CONSTRAINT "space_links_space_Id_link_Id_pk" PRIMARY KEY("space_Id","link_Id");
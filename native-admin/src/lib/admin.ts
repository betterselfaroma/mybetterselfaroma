export const BOOKING_SELECT =
  "id,customer_id,user_id,package_type,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,points_awarded,referral_reward_created,created_at";

export const CUSTOMER_SELECT =
  "id,auth_user_id,email,name,phone,referral_code,points_balance,points,created_at,qr_token,role,is_admin";

export const REWARD_PRODUCT_SELECT =
  "id,name,description,image_url,points_cost,stock,active,sort_order,created_by,created_at,updated_at";

export const CMS_SECTION_SELECT =
  "id,page_slug,section_key,section_type,title,subtitle,body,image_url,button_text,button_url,visible,sort_order,created_at,updated_at";

export const ALLOWED_BOOKING_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);


export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "admin_users": {
                  Row: {
                    "created_at": string,"email": string,"failed_login_count": number,"id": string,"is_active": boolean,"last_login_at": string | null,"locked_until": string | null,"name": string,"password_hash": string,"role": Database["public"]['Enums']["admin_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"failed_login_count"?: number,"id"?: string,"is_active"?: boolean,"last_login_at"?: string | null,"locked_until"?: string | null,"name": string,"password_hash": string,"role"?: Database["public"]['Enums']["admin_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"failed_login_count"?: number,"id"?: string,"is_active"?: boolean,"last_login_at"?: string | null,"locked_until"?: string | null,"name"?: string,"password_hash"?: string,"role"?: Database["public"]['Enums']["admin_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"banners": {
                  Row: {
                    "alt": string,"created_at": string,"cta_href": string | null,"cta_label": string | null,"ends_at": string | null,"id": string,"image_desktop_path": string,"image_mobile_path": string | null,"is_active": boolean,"placement": string,"sort_order": number,"starts_at": string | null,"subtitle": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt": string,"created_at"?: string,"cta_href"?: string | null,"cta_label"?: string | null,"ends_at"?: string | null,"id"?: string,"image_desktop_path": string,"image_mobile_path"?: string | null,"is_active"?: boolean,"placement": string,"sort_order"?: number,"starts_at"?: string | null,"subtitle"?: string | null,"title": string
                  }
                  Update: {
                    "alt"?: string,"created_at"?: string,"cta_href"?: string | null,"cta_label"?: string | null,"ends_at"?: string | null,"id"?: string,"image_desktop_path"?: string,"image_mobile_path"?: string | null,"is_active"?: boolean,"placement"?: string,"sort_order"?: number,"starts_at"?: string | null,"subtitle"?: string | null,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"collections": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"image_path": string | null,"is_active": boolean,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"is_active"?: boolean,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"is_active"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"delivery_zones": {
                  Row: {
                    "district": string,"estimated_days": string,"fee_lkr": number,"id": string,"is_active": boolean,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "district": string,"estimated_days": string,"fee_lkr": number,"id"?: string,"is_active"?: boolean,"sort_order"?: number
                  }
                  Update: {
                    "district"?: string,"estimated_days"?: string,"fee_lkr"?: number,"id"?: string,"is_active"?: boolean,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"invoices": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"number": string,"order_id": string,"pdf_path": string,"sha256": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind": string,"number": string,"order_id": string,"pdf_path": string,"sha256": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"number"?: string,"order_id"?: string,"pdf_path"?: string,"sha256"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invoices_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"newsletter_subscribers": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"source": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"source"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"source"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"notes": {
                  Row: {
                    "id": string,"name": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string,"slug": string
                  }
                  Update: {
                    "id"?: string,"name"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"notification_outbox": {
                  Row: {
                    "attempts": number,"channel": string,"created_at": string,"event": Database["public"]['Enums']["notification_event"],"id": string,"last_error": string | null,"locked_at": string | null,"next_attempt_at": string,"order_id": string,"provider_message_id": string | null,"sent_at": string | null,"status": Database["public"]['Enums']["notification_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"channel"?: string,"created_at"?: string,"event": Database["public"]['Enums']["notification_event"],"id"?: string,"last_error"?: string | null,"locked_at"?: string | null,"next_attempt_at"?: string,"order_id": string,"provider_message_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["notification_status"],"updated_at"?: string
                  }
                  Update: {
                    "attempts"?: number,"channel"?: string,"created_at"?: string,"event"?: Database["public"]['Enums']["notification_event"],"id"?: string,"last_error"?: string | null,"locked_at"?: string | null,"next_attempt_at"?: string,"order_id"?: string,"provider_message_id"?: string | null,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["notification_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_outbox_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"order_events": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"note": string | null,"order_id": string,"status": Database["public"]['Enums']["order_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"order_id": string,"status": Database["public"]['Enums']["order_status"]
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"order_id"?: string,"status"?: Database["public"]['Enums']["order_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_events_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "admin_users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_events_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"line_total_lkr": number | null,"order_id": string,"product_name": string,"quantity": number,"sku": string | null,"unit_price_lkr": number,"variant_id": string | null,"variant_label": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"line_total_lkr"?: never,"order_id": string,"product_name": string,"quantity": number,"sku"?: string | null,"unit_price_lkr": number,"variant_id"?: string | null,"variant_label": string
                  }
                  Update: {
                    "id"?: string,"line_total_lkr"?: never,"order_id"?: string,"product_name"?: string,"quantity"?: number,"sku"?: string | null,"unit_price_lkr"?: number,"variant_id"?: string | null,"variant_label"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "address_line": string,"city": string,"code": string,"created_at": string,"customer_name": string,"delivery_fee_lkr": number,"district": string,"email": string | null,"id": string,"idempotency_key": string | null,"notes": string | null,"payment_method": Database["public"]['Enums']["payment_method"],"payment_status": Database["public"]['Enums']["payment_status"],"phone_e164": string,"status": Database["public"]['Enums']["order_status"],"subtotal_lkr": number,"total_lkr": number,"updated_at": string,"whatsapp_opt_in": boolean,"whatsapp_opt_in_at": string | null,"whatsapp_opt_in_source": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address_line": string,"city": string,"code"?: string,"created_at"?: string,"customer_name": string,"delivery_fee_lkr": number,"district": string,"email"?: string | null,"id"?: string,"idempotency_key"?: string | null,"notes"?: string | null,"payment_method": Database["public"]['Enums']["payment_method"],"payment_status"?: Database["public"]['Enums']["payment_status"],"phone_e164": string,"status"?: Database["public"]['Enums']["order_status"],"subtotal_lkr": number,"total_lkr": number,"updated_at"?: string,"whatsapp_opt_in"?: boolean,"whatsapp_opt_in_at"?: string | null,"whatsapp_opt_in_source"?: string | null
                  }
                  Update: {
                    "address_line"?: string,"city"?: string,"code"?: string,"created_at"?: string,"customer_name"?: string,"delivery_fee_lkr"?: number,"district"?: string,"email"?: string | null,"id"?: string,"idempotency_key"?: string | null,"notes"?: string | null,"payment_method"?: Database["public"]['Enums']["payment_method"],"payment_status"?: Database["public"]['Enums']["payment_status"],"phone_e164"?: string,"status"?: Database["public"]['Enums']["order_status"],"subtotal_lkr"?: number,"total_lkr"?: number,"updated_at"?: string,"whatsapp_opt_in"?: boolean,"whatsapp_opt_in_at"?: string | null,"whatsapp_opt_in_source"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"payments": {
                  Row: {
                    "amount_lkr": number,"id": string,"method": Database["public"]['Enums']["payment_method"],"order_id": string,"received_at": string,"recorded_by": string | null,"reference": string | null,"slip_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_lkr": number,"id"?: string,"method": Database["public"]['Enums']["payment_method"],"order_id": string,"received_at"?: string,"recorded_by"?: string | null,"reference"?: string | null,"slip_path"?: string | null
                  }
                  Update: {
                    "amount_lkr"?: number,"id"?: string,"method"?: Database["public"]['Enums']["payment_method"],"order_id"?: string,"received_at"?: string,"recorded_by"?: string | null,"reference"?: string | null,"slip_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_recorded_by_fkey"
      columns: ["recorded_by"]
isOneToOne: false
      referencedRelation: "admin_users"
      referencedColumns: ["id"]
    }
                  ]
                },"product_collections": {
                  Row: {
                    "collection_id": string,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_id": string,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "collection_id"?: string,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_collections_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_collections_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_images": {
                  Row: {
                    "alt": string,"height": number | null,"id": string,"path": string,"product_id": string,"sort_order": number,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt": string,"height"?: number | null,"id"?: string,"path": string,"product_id": string,"sort_order"?: number,"width"?: number | null
                  }
                  Update: {
                    "alt"?: string,"height"?: number | null,"id"?: string,"path"?: string,"product_id"?: string,"sort_order"?: number,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_notes": {
                  Row: {
                    "note_id": string,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "note_id": string,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "note_id"?: string,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_notes_note_id_fkey"
      columns: ["note_id"]
isOneToOne: false
      referencedRelation: "notes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_notes_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "compare_at_lkr": number | null,"created_at": string,"id": string,"is_active": boolean,"label": string,"price_lkr": number,"product_id": string,"sku": string | null,"sort_order": number,"stock": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "compare_at_lkr"?: number | null,"created_at"?: string,"id"?: string,"is_active"?: boolean,"label": string,"price_lkr": number,"product_id": string,"sku"?: string | null,"sort_order"?: number,"stock"?: number,"updated_at"?: string
                  }
                  Update: {
                    "compare_at_lkr"?: number | null,"created_at"?: string,"id"?: string,"is_active"?: boolean,"label"?: string,"price_lkr"?: number,"product_id"?: string,"sku"?: string | null,"sort_order"?: number,"stock"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "created_at": string,"description": string | null,"gender": string | null,"id": string,"is_active": boolean,"is_featured": boolean,"name": string,"occasions": (string)[],"rating_avg": number,"rating_count": number,"short_description": string | null,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"gender"?: string | null,"id"?: string,"is_active"?: boolean,"is_featured"?: boolean,"name": string,"occasions"?: (string)[],"rating_avg"?: number,"rating_count"?: number,"short_description"?: string | null,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"gender"?: string | null,"id"?: string,"is_active"?: boolean,"is_featured"?: boolean,"name"?: string,"occasions"?: (string)[],"rating_avg"?: number,"rating_count"?: number,"short_description"?: string | null,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reviews": {
                  Row: {
                    "approved_at": string | null,"body": string,"created_at": string,"customer_name": string,"id": string,"is_verified": boolean,"location": string | null,"order_id": string | null,"product_id": string,"rating": number,"status": Database["public"]['Enums']["review_status"],"title": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"body": string,"created_at"?: string,"customer_name": string,"id"?: string,"is_verified"?: boolean,"location"?: string | null,"order_id"?: string | null,"product_id": string,"rating": number,"status"?: Database["public"]['Enums']["review_status"],"title"?: string | null
                  }
                  Update: {
                    "approved_at"?: string | null,"body"?: string,"created_at"?: string,"customer_name"?: string,"id"?: string,"is_verified"?: boolean,"location"?: string | null,"order_id"?: string | null,"product_id"?: string,"rating"?: number,"status"?: Database["public"]['Enums']["review_status"],"title"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"site_settings": {
                  Row: {
                    "is_public": boolean,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "is_public"?: boolean,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value": NonNullable<Json>
                  }
                  Update: {
                    "is_public"?: boolean,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "site_settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "admin_users"
      referencedColumns: ["id"]
    }
                  ]
                },"whatsapp_messages": {
                  Row: {
                    "body_preview": string | null,"created_at": string,"direction": string,"error_code": string | null,"id": string,"order_id": string | null,"outbox_id": string | null,"phone_e164": string,"provider_message_id": string | null,"status": string | null,"template_name": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_preview"?: string | null,"created_at"?: string,"direction": string,"error_code"?: string | null,"id"?: string,"order_id"?: string | null,"outbox_id"?: string | null,"phone_e164": string,"provider_message_id"?: string | null,"status"?: string | null,"template_name"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "body_preview"?: string | null,"created_at"?: string,"direction"?: string,"error_code"?: string | null,"id"?: string,"order_id"?: string | null,"outbox_id"?: string | null,"phone_e164"?: string,"provider_message_id"?: string | null,"status"?: string | null,"template_name"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "whatsapp_messages_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "whatsapp_messages_outbox_id_fkey"
      columns: ["outbox_id"]
isOneToOne: false
      referencedRelation: "notification_outbox"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_order":
{ Args: { "p_address_line": string,"p_city": string,"p_customer_name": string,"p_district": string,"p_email"?: string,"p_idempotency_key": string,"p_items": Json,"p_notes"?: string,"p_payment_method": Database["public"]['Enums']["payment_method"],"p_phone_e164": string,"p_whatsapp_opt_in": boolean }; Returns: Json
                           },
"record_payment":
{ Args: { "p_amount_lkr": number,"p_method": Database["public"]['Enums']["payment_method"],"p_order_id": string,"p_recorded_by": string,"p_reference"?: string,"p_slip_path"?: string }; Returns: Json
                           }
          }
          Enums: {
            "admin_role": "admin"|"staff","notification_event": "order_placed"|"payment_received"|"order_dispatched"|"order_delivered"|"order_cancelled","notification_status": "pending"|"processing"|"sent"|"delivered"|"read"|"failed"|"skipped","order_status": "pending"|"confirmed"|"packed"|"dispatched"|"delivered"|"cancelled"|"returned","payment_method": "cod"|"bank_transfer","payment_status": "unpaid"|"awaiting_verification"|"paid"|"refunded","review_status": "pending"|"approved"|"rejected"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "admin_role": ["admin", "staff"],"notification_event": ["order_placed", "payment_received", "order_dispatched", "order_delivered", "order_cancelled"],"notification_status": ["pending", "processing", "sent", "delivered", "read", "failed", "skipped"],"order_status": ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled", "returned"],"payment_method": ["cod", "bank_transfer"],"payment_status": ["unpaid", "awaiting_verification", "paid", "refunded"],"review_status": ["pending", "approved", "rejected"]
          }
        }
} as const

import os
import base64
import requests
from supabase import create_client, Client

supabase: Client = create_client(
  'SUPABASE_URL',
  "SUPABASE_SERVICE_ROLE")

def convert_base64_to_storage():
    try:
        response = supabase.table("users").select("id, photo").filter("photo", "not.is", "null").execute()
        users = response.data

        print(f"Found {len(users)} users with photos")

        success_count = 0
        error_count = 0

        for user in users:
            try:
                if not user["photo"] or not user ["photo"].startswith('data:image'):
                    print(f"Skipping user {user['id']} - no valid base64 image")
                    continue
                
                print(f"Processing user {user['id']}...")

                base64_data = user['photo'].split(',')[1]
                image_bytes = base64.b64decode(base64_data)

                file_path = f"{user['id']}-profile.jpg"
                storage_response = supabase.storage.from_('profile-images').upload(
                    file_path,
                    image_bytes,
                    {"content-type": "image/jpeg", "upsert": 'true'}
                )

                if hasattr(storage_response, "error") and storage_response.error:
                    print(f"Error uploading image for user {user['id']}: {storage_response.error}")
                    error_count += 1
                    continue

                public_url = supabase.storage.from_("profile-images").get_public_url(file_path)

                update_response = supabase.table('users').update(
                    {"photo": public_url}
                ).eq("id", user['id']).execute()

                if hasattr(update_response, "error") and update_response.error:
                    print(f"Error updating photo URL and user {user['id']}: {update_response.error}")
                    error_count += 1
                    continue
                    
                print(f"Successfully processed user {user['id']}")
                success_count += 1
            
            except Exception as e:
                print(f"Error processing user {user['id']}: {str(e)}")
                error_count += 1

        print(f"\nConversion complete!")
        print(f"Successfully converting: {success_count}")
        print(f"Failed: {error_count}")

    except Exception as e:
        print(f"Error in converting base64 to storage: {str(e)}")

if __name__ == "__main__":
    convert_base64_to_storage()
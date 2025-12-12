const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- 1. Testing Transaction Fetch (Exact App Query) ---");

    // This query matches getUserTransactions in actions.ts EXACTLY
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id,
            status,
            created_at,
            lender_id,
            borrower_id,
            book:textbooks (
                id,
                title,
                image_url,
                course_id
            ),
            borrower:profiles!transactions_borrower_id_fkey (
                id,
                full_name,
                email
            ),
            lender:profiles!transactions_lender_id_fkey (
                id,
                full_name,
                email
            )
        `)
        .limit(1);

    if (error) {
        console.error("❌ QUERY FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Details:", error.details);
        console.log("\n>>> DIAGNOSIS: The app cannot fetch transactions because of this error.");
        if (error.message.includes("course_id")) {
            console.log(">>> CONFIRMED: Missing 'course_id' column is the cause.");
        }
    } else {
        console.log("✅ Query Successful. Metadata:");
        console.log("Count:", data.length);
        if (data.length > 0) console.log("Sample:", JSON.stringify(data[0], null, 2));
    }

    console.log("\n--- 2. Checking Chat Messages Table ---");
    const { error: chatError } = await supabase.from('messages').select('id').limit(1);
    if (chatError) {
        console.error("❌ Chat Table Check Failed:", chatError.message);
    } else {
        console.log("✅ Chat Table 'messages' exists and is accessible.");
    }
}

diagnose();

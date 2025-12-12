const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTransactions() {
    console.log("--- Debugging Transactions ---");

    // 1. Check total count
    const { count, error: countError } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
    if (countError) {
        console.error("Error counting transactions:", countError);
        return;
    }
    console.log(`Total Transactions in DB: ${count}`);

    if (count === 0) {
        console.log("No transactions found. The 'Request' action might be failing.");
        // Check textbooks
        const { count: bookCount } = await supabase.from('textbooks').select('*', { count: 'exact', head: true });
        console.log(`Total Textbooks: ${bookCount}`);
        return;
    }

    // 2. List last 5 transactions
    const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select(`
      id, 
      status, 
      borrower_id, 
      lender_id, 
      book_id,
      created_at
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (txError) {
        console.error("Error fetching transactions:", txError);
        return;
    }

    console.log("Latest 5 Transactions:");
    txs.forEach(tx => {
        console.log(`- ID: ${tx.id}, Status: ${tx.status}, Borrower: ${tx.borrower_id}, Lender: ${tx.lender_id}, Book: ${tx.book_id}`);
    });

    // 3. Check Profiles
    console.log("\nChecking Profiles for these users...");
    const userIds = new Set([...txs.map(t => t.borrower_id), ...txs.map(t => t.lender_id)]);

    for (const uid of userIds) {
        const { data: profile } = await supabase.from('profiles').select('id, full_name, email').eq('id', uid).single();
        if (profile) {
            console.log(`User ${uid}: Found (${profile.email || 'No Email'})`);
        } else {
            console.error(`User ${uid}: NOT FOUND in profiles table! This will break the JOIN.`);
        }
    }

    console.log("\n--- End Debug ---");
}

debugTransactions();

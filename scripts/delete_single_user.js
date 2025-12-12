
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const match = trimmedLine.match(/^(?:export\s+)?([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.includes('#')) value = value.split('#')[0].trim();
            value = value.replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function deleteUser(userId) {
    if (!userId) {
        console.error('Usage: node delete_single_user.js <user_id>');
        process.exit(1);
    }

    console.log(`Starting cleanup for user: ${userId}`);

    // 1. Delete Reviews involving this user (reviewer or target)
    console.log('Deleting reviews...');
    const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .or(`reviewer_id.eq.${userId},target_id.eq.${userId}`);

    if (reviewError) console.error('Error deleting reviews (user specific):', reviewError);

    // 1.5 Delete Reviews linked to transactions involving this user (because Transaction deletion needs Reviews gone)
    // Find transactions involving user
    const { data: transactions, error: txnFetchError } = await supabase
        .from('transactions')
        .select('id')
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`);

    if (transactions && transactions.length > 0) {
        const txnIds = transactions.map(t => t.id);
        console.log(`Found ${txnIds.length} transactions. Deleting associated reviews...`);
        const { error: txnReviewError } = await supabase
            .from('reviews')
            .delete()
            .in('transaction_id', txnIds);
        if (txnReviewError) console.error('Error deleting transaction reviews:', txnReviewError);
    }

    // 2. Delete Transactions involving this user
    console.log('Deleting transactions...');
    const { error: txnError } = await supabase
        .from('transactions')
        .delete()
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`);

    if (txnError) console.error('Error deleting transactions:', txnError);

    // 3. Delete Textbooks owned by user (Should cascade from profile, but doing explicit is cleaner/safer)
    console.log('Deleting textbooks...');
    const { error: bookError } = await supabase
        .from('textbooks')
        .delete()
        .eq('owner_id', userId);

    if (bookError) console.error('Error deleting textbooks:', bookError);

    // 4. Delete User (Cascades to Profile)
    console.log('Deleting auth user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
        console.error(`Failed to delete user ${userId}:`, deleteError);
    } else {
        console.log(`Successfully deleted user ${userId}`);
    }
}

const targetUserId = process.argv[2];
deleteUser(targetUserId);

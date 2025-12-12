
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    console.log('Raw .env.local length:', envConfig.length);

    envConfig.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        // Handle "export KEY=VALUE" or "KEY=VALUE"
        const match = trimmedLine.match(/^(?:export\s+)?([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Remove inline comments (naive) - assuming no # inside the value
            if (value.includes('#')) {
                value = value.split('#')[0].trim();
            }

            // Remove surrounding quotes
            value = value.replace(/^["'](.*)["']$/, '$1');

            process.env[key] = value;
            console.log(`Loaded key: ${key}`);
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    console.error('Loaded keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function deleteAllUsers() {
    console.log('Starting full cleanup...');

    // 1. Delete Reviews
    console.log('Deleting all reviews...');
    const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (reviewError) {
        console.error('Error deleting reviews:', reviewError);
        // Proceeding anyway
    }

    // 2. Delete Messages
    console.log('Deleting all messages...');
    const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (messagesError) {
        console.error('Error deleting messages:', messagesError);
    }

    // 3. Delete Transactions
    console.log('Deleting all transactions...');
    const { error: txnError } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (txnError) {
        console.error('Error deleting transactions:', txnError);
    }

    // 4. Delete Textbooks
    console.log('Deleting all textbooks...');
    const { error: bookError } = await supabase
        .from('textbooks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (bookError) {
        console.error('Error deleting textbooks:', bookError);
    }

    // 5. Delete Users
    console.log('Fetching all users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found to delete.');
        return;
    }

    console.log(`Found ${users.length} users. Deleting...`);

    for (const user of users) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error(`Failed to delete user ${user.id}:`, deleteError);
        } else {
            console.log(`Deleted user ${user.id}`);
        }
    }

    console.log('Cleanup complete.');
}

deleteAllUsers();

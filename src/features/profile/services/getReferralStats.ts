import { supabase } from "@/config/supabase";

const getTotalReferrals = async (userId) => {
    const {count: totalReferrals} = await supabase
      .from("referrals")
      .select("*", {count: "exact", head: true})
      .eq("referrer_id", userId)
  
    return totalReferrals
  }
  
  const getSuccessfulReferrals = async (userId) => {
    const {count: successfulReferrals} = await supabase
      .from("referrals")
      .select("*, users!inner(email_confirmed_at)", {count: "exact", head: true})
      .eq('referrer_id', userId)
      .not("users.email_confirmed_at", "is", null)
  
    return successfulReferrals
  }
  
  const getPendingReferrals = async (userId) => {
    const {data: referrals} = await supabase
      .from("referrals")
      .select("referred_id")
      .eq("referrer_id", userId)
  
    const referredIds = referrals.map(r => r.referred_id)
  
    const {count: pendingReferrals} = await supabase
      .from('referral_clicks')
      .select('*', {count: "exact", head: true})
      .eq("referrer_id", userId)
      .not("clicked_user_id", "in", referredIds)
  
    return pendingReferrals
  }  

export const getReferralStats = async (
    userId: string,
    setTotalReferrals: React.Dispatch<React.SetStateAction<number>>,
    setPendingReferrals: React.Dispatch<React.SetStateAction<number>>,
    setSuccessfulReferrals: React.Dispatch<React.SetStateAction<number>>
  ) => {
    try {
      // Get total clicks (how many times the referral link was clicked)
      const { data: clicksData, error: clicksError } = await supabase
        .from('referral_clicks')
        .select('id')
        .eq('referrer_id', userId);
  
      if (clicksError) throw clicksError;
      const totalClicks = clicksData?.length || 0;
  
      // Get successful referrals (users who actually signed up)
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('referred_id')
        .eq('referrer_id', userId);
  
      if (referralsError) throw referralsError;
      const successfulReferrals = referralsData?.length || 0;
  
      // Calculate pending referrals (clicks - successful signups)
      const pendingReferrals = totalClicks - successfulReferrals;
  
      setTotalReferrals(totalClicks);
      setSuccessfulReferrals(successfulReferrals);
      setPendingReferrals(pendingReferrals);
  
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      setTotalReferrals(0);
      setPendingReferrals(0);
      setSuccessfulReferrals(0);
    }
  };
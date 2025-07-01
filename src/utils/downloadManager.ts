/**
 * Secure Download Manager
 * Handles secure MP3 downloads with token validation
 */

import { supabase } from '../lib/supabase';

interface DownloadOptions {
  filename?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface DownloadToken {
  id: string;
  track_id: string;
  email: string;
  expires_at: string;
  download_count: number;
  max_downloads: number;
  is_active: boolean;
}

export class SecureDownloadManager {
  /**
   * Verify if a user has purchased an audio file
   */
  static async verifyPurchase(email: string, trackId: string): Promise<{
    hasPurchased: boolean;
    token?: DownloadToken;
    error?: string;
  }> {
    try {
      // Check for valid download tokens
      const { data: tokens, error } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('email', email)
        .eq('track_id', trackId)
        .eq('is_active', true)
        .lt('download_count', supabase.raw('max_downloads'))
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error verifying purchase:', error);
        return { hasPurchased: false, error: 'Failed to verify purchase status' };
      }

      if (tokens && tokens.length > 0) {
        return { hasPurchased: true, token: tokens[0] };
      }

      // If no valid token found, check donation records
      const { data: donations, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('customer_email', email)
        .eq('status', 'completed')
        .eq('metadata->title', trackId)
        .limit(1);

      if (donationError) {
        console.error('Error checking donations:', donationError);
        return { hasPurchased: false, error: 'Failed to verify purchase status' };
      }

      return { hasPurchased: donations && donations.length > 0 };
    } catch (err) {
      console.error('Error in verifyPurchase:', err);
      return { hasPurchased: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Download a purchased audio file securely
   */
  static async downloadSecureAudio(
    tokenId: string,
    trackId: string,
    options: DownloadOptions = {}
  ): Promise<boolean> {
    try {
      const { onProgress, onComplete, onError, filename } = options;
      
      // Call the download-audio function to validate the token and get the download URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/download-audio?token=${tokenId}`;
      
      // Start progress at 10%
      onProgress?.(10);
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Progress to 30%
      onProgress?.(30);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Download authorization failed');
      }
      
      // Progress to 50%
      onProgress?.(50);
      
      // In a real implementation, data.track_id would be a signed URL
      // For this example, we'll use the track_id directly
      const audioUrl = trackId;
      
      // Download the file
      const audioResponse = await fetch(audioUrl);
      
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio file: ${audioResponse.status}`);
      }
      
      // Progress to 80%
      onProgress?.(80);
      
      const blob = await audioResponse.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      
      // Complete progress
      onProgress?.(100);
      onComplete?.();
      
      return true;
    } catch (error) {
      console.error('Secure download failed:', error);
      options.onError?.(error instanceof Error ? error : new Error('Download failed'));
      return false;
    }
  }

  /**
   * Create a download token for a purchased audio file
   */
  static async createDownloadToken(
    sessionId: string,
    trackId: string,
    email: string
  ): Promise<{ success: boolean; tokenId?: string; error?: string }> {
    try {
      // Check if token already exists
      const { data: existingTokens } = await supabase
        .from('download_tokens')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .limit(1);
      
      if (existingTokens && existingTokens.length > 0) {
        return { success: true, tokenId: existingTokens[0].id };
      }
      
      // Create expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      // Create new token
      const { data, error } = await supabase
        .from('download_tokens')
        .insert({
          stripe_session_id: sessionId,
          track_id: trackId,
          email: email,
          expires_at: expiryDate.toISOString(),
          max_downloads: 3,
          is_active: true
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating download token:', error);
        return { success: false, error: 'Failed to create download token' };
      }
      
      return { success: true, tokenId: data.id };
    } catch (err) {
      console.error('Error in createDownloadToken:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Send a backup download link via email
   */
  static async sendEmailBackup(
    email: string,
    tokenId: string,
    trackTitle: string,
    artist: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you would call a server function to send an email
      // For this example, we'll just simulate it
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      // This would be a real endpoint in a production environment
      const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-download-email`;
      
      const response = await fetch(emailFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          tokenId,
          trackTitle,
          artist
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error sending email backup:', err);
      return { success: false, error: 'Failed to send email backup' };
    }
  }

  /**
   * Get download history for a user
   */
  static async getDownloadHistory(email: string): Promise<{
    history: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('download_logs')
        .select(`
          id,
          downloaded_at,
          track_id,
          download_tokens (
            stripe_session_id
          )
        `)
        .eq('email', email)
        .order('downloaded_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching download history:', error);
        return { history: [], error: 'Failed to fetch download history' };
      }
      
      return { history: data || [] };
    } catch (err) {
      console.error('Error in getDownloadHistory:', err);
      return { history: [], error: 'An unexpected error occurred' };
    }
  }
}

// Export utility functions
export const verifyPurchase = SecureDownloadManager.verifyPurchase.bind(SecureDownloadManager);
export const downloadSecureAudio = SecureDownloadManager.downloadSecureAudio.bind(SecureDownloadManager);
export const createDownloadToken = SecureDownloadManager.createDownloadToken.bind(SecureDownloadManager);
export const sendEmailBackup = SecureDownloadManager.sendEmailBackup.bind(SecureDownloadManager);
export const getDownloadHistory = SecureDownloadManager.getDownloadHistory.bind(SecureDownloadManager);
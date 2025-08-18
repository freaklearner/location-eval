#!/usr/bin/env node

/**
 * 📊 Batch Location Processor for TMM Cart Locations
 * 
 * This script processes multiple locations from the CSV file,
 * evaluates each location using the backend API, generates PDF reports,
 * and emails them to the specified recipient.
 */

const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { createReadStream } = require('fs');

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:3001/api',
  EMAIL_RECIPIENT: 'shub.shubhamthakur@gmail.com',
  REPORTS_FOLDER: path.join(__dirname, '../reports/location-evaluations'),
  CSV_FILE: path.join(__dirname, '../CART SHEET-2023- 2025 - AI-Location.csv'),
  BATCH_SIZE: 3, // Process 3 locations at a time to avoid rate limiting
  DELAY_BETWEEN_BATCHES: 30000, // 30 seconds delay between batches
};

// Email configuration (using temporary email service)
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'tmm.reports.temp@gmail.com', // Temporary email for sending reports
    pass: 'temp_password_123' // This would be set via environment variable in production
  }
};

class BatchLocationProcessor {
  constructor() {
    this.transporter = null;
    this.processedCount = 0;
    this.failedCount = 0;
    this.results = [];
  }

  /**
   * 🚀 Main processing function
   */
  async process() {
    try {
      console.log('🎯 Starting Batch Location Processing...');
      
      // Initialize email transporter
      await this.initializeEmailTransporter();
      
      // Create reports folder
      await this.createReportsFolder();
      
      // Parse CSV and extract locations
      const locations = await this.parseCSVFile();
      console.log(`📍 Found ${locations.length} locations with valid coordinates`);
      
      // Process locations in batches
      await this.processLocationsBatch(locations);
      
      // Send summary email
      await this.sendSummaryEmail();
      
      console.log('✅ Batch processing completed successfully!');
      console.log(`📊 Processed: ${this.processedCount}, Failed: ${this.failedCount}`);
      
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      throw error;
    }
  }

  /**
   * 📧 Initialize email transporter
   */
  async initializeEmailTransporter() {
    console.log('📧 Initializing email transporter...');
    
    // For demo purposes, we'll use a test account
    // In production, you would use proper email credentials
    const testAccount = await nodemailer.createTestAccount();
    
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('✅ Email transporter initialized');
    console.log(`📧 Test email account: ${testAccount.user}`);
  }

  /**
   * 📁 Create reports folder structure
   */
  async createReportsFolder() {
    try {
      await fs.mkdir(CONFIG.REPORTS_FOLDER, { recursive: true });
      console.log(`📁 Created reports folder: ${CONFIG.REPORTS_FOLDER}`);
    } catch (error) {
      console.error('❌ Failed to create reports folder:', error);
      throw error;
    }
  }

  /**
   * 📄 Parse CSV file and extract locations
   */
  async parseCSVFile() {
    return new Promise((resolve, reject) => {
      const locations = [];
      
      createReadStream(CONFIG.CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          // Extract locations with valid coordinates
          const lat = parseFloat(row.LAT);
          const lng = parseFloat(row.LNG);
          
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            locations.push({
              clientName: row['Client Name'] || 'Unknown Client',
              ranking: row.Ranking || 'N/A',
              totalSale: row['Total sale'] || '0',
              revPerDay: row['Rev/day'] || '0',
              state: row.State || 'Unknown',
              address: row['Address Location'] || 'Unknown Address',
              status: row.STATUS || 'Unknown',
              lat: lat,
              lng: lng,
              googleListing: row['Google Listing'] || 'Unknown',
              startDate: row['Starting Date'] || 'Unknown',
              vegNonVeg: row['VEG/NV'] || 'Both',
              profession: row.Profession || 'Unknown'
            });
          }
        })
        .on('end', () => {
          console.log(`✅ Parsed CSV file: ${locations.length} valid locations found`);
          resolve(locations);
        })
        .on('error', (error) => {
          console.error('❌ Failed to parse CSV file:', error);
          reject(error);
        });
    });
  }

  /**
   * 🔄 Process locations in batches
   */
  async processLocationsBatch(locations) {
    const batches = this.chunkArray(locations, CONFIG.BATCH_SIZE);
    
    console.log(`🔄 Processing ${locations.length} locations in ${batches.length} batches`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} locations)`);
      
      // Process batch in parallel
      const batchPromises = batch.map((location, index) => 
        this.processLocation(location, `${i * CONFIG.BATCH_SIZE + index + 1}`)
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        this.processBatchResults(batchResults);
        
        // Delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          console.log(`⏱️ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
          await this.delay(CONFIG.DELAY_BETWEEN_BATCHES);
        }
        
      } catch (error) {
        console.error(`❌ Batch ${i + 1} processing failed:`, error);
      }
    }
  }

  /**
   * 📍 Process individual location
   */
  async processLocation(location, sequenceNumber) {
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Processing: ${location.clientName} (${location.address})`);
      
      // Call backend API for location analysis
      const analysisData = await this.analyzeLocation(location);
      
      // Generate PDF report
      const pdfPath = await this.generatePDFReport(location, analysisData, sequenceNumber);
      
      // Send email with report
      const emailResult = await this.sendEmailReport(location, pdfPath);
      
      const processingTime = Date.now() - startTime;
      
      const result = {
        success: true,
        clientName: location.clientName,
        address: location.address,
        pdfPath,
        emailResult,
        processingTime,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      this.processedCount++;
      
      console.log(`✅ Completed: ${location.clientName} (${processingTime}ms)`);
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to process ${location.clientName}:`, error.message);
      
      const result = {
        success: false,
        clientName: location.clientName,
        address: location.address,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      this.failedCount++;
      
      throw error;
    }
  }

  /**
   * 🔍 Analyze location using backend API
   */
  async analyzeLocation(location) {
    try {
      const response = await axios.post(`${CONFIG.BACKEND_URL}/analysis/complete`, {
        lat: location.lat,
        lng: location.lng,
        radius: 1000, // Default 1km radius
        clientName: location.clientName,
        address: location.address
      }, {
        timeout: 120000 // 2 minutes timeout
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * 📄 Generate PDF report
   */
  async generatePDFReport(location, analysisData, sequenceNumber) {
    const fileName = `${sequenceNumber.padStart(2, '0')}_${location.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Location_Report.pdf`;
    const filePath = path.join(CONFIG.REPORTS_FOLDER, fileName);
    
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = require('fs').createWriteStream(filePath);
      doc.pipe(writeStream);
      
      // Add report content
      await this.addPDFContent(doc, location, analysisData);
      
      doc.end();
      
      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      
      console.log(`📄 PDF generated: ${fileName}`);
      return filePath;
      
    } catch (error) {
      console.error(`❌ PDF generation failed for ${location.clientName}:`, error);
      throw error;
    }
  }

  /**
   * 📝 Add content to PDF report
   */
  async addPDFContent(doc, location, analysisData) {
    const ai = analysisData.aiEvaluation || {};
    const confidence = analysisData.confidenceScore || {};
    const locationAnalysis = analysisData.locationAnalysis || {};
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold')
       .text('🍥 THE MOMOS MAFIA', 50, 50)
       .fontSize(16).font('Helvetica')
       .text('Location Evaluation Report', 50, 80);
    
    // Client Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('📍 Client Information', 50, 120);
    
    doc.fontSize(12).font('Helvetica')
       .text(`Client Name: ${location.clientName}`, 50, 145)
       .text(`Address: ${location.address}`, 50, 165)
       .text(`State: ${location.state}`, 50, 185)
       .text(`Status: ${location.status}`, 50, 205)
       .text(`Business Type: ${location.vegNonVeg}`, 50, 225)
       .text(`Profession: ${location.profession}`, 50, 245);
    
    // Performance Metrics (if available)
    if (location.totalSale && location.totalSale !== '0') {
      doc.fontSize(14).font('Helvetica-Bold')
         .text('💰 Performance Metrics', 50, 280);
      
      doc.fontSize(12).font('Helvetica')
         .text(`Total Sales: ₹${location.totalSale}`, 50, 305)
         .text(`Revenue per Day: ₹${location.revPerDay}`, 50, 325)
         .text(`Ranking: ${location.ranking || 'N/A'}`, 50, 345);
    }
    
    // Location Coordinates
    doc.fontSize(14).font('Helvetica-Bold')
       .text('🗺️ Location Details', 50, 380);
    
    doc.fontSize(12).font('Helvetica')
       .text(`Latitude: ${location.lat}`, 50, 405)
       .text(`Longitude: ${location.lng}`, 50, 425)
       .text(`Google Listing: ${location.googleListing}`, 50, 445);
    
    // AI Evaluation Results
    if (ai.viabilityStatus) {
      doc.fontSize(14).font('Helvetica-Bold')
         .text('🤖 AI Evaluation Results', 50, 480);
      
      doc.fontSize(12).font('Helvetica')
         .text(`Viability Status: ${ai.viabilityStatus}`, 50, 505)
         .text(`Overall Score: ${ai.percentage?.toFixed(1) || 'N/A'}%`, 50, 525)
         .text(`Total Score: ${ai.totalScore || 'N/A'}/${ai.maxPossibleScore || 'N/A'}`, 50, 545);
    }
    
    // Confidence Score
    if (confidence.score) {
      doc.fontSize(14).font('Helvetica-Bold')
         .text('📊 Confidence Analysis', 50, 580);
      
      doc.fontSize(12).font('Helvetica')
         .text(`Confidence Score: ${confidence.score?.toFixed(1) || 'N/A'}%`, 50, 605)
         .text(`Confidence Level: ${confidence.level || 'N/A'}`, 50, 625);
    }
    
    // Business Analysis Summary
    if (locationAnalysis.summary) {
      const summary = locationAnalysis.summary.overall || {};
      
      doc.fontSize(14).font('Helvetica-Bold')
         .text('🏢 Business Environment', 50, 660);
      
      doc.fontSize(12).font('Helvetica')
         .text(`Total Businesses Found: ${summary.totalBusinesses || 'N/A'}`, 50, 685)
         .text(`Competition Level: ${summary.enhancedMetrics?.competitionScore || 'N/A'}/5`, 50, 705)
         .text(`Quality Index: ${summary.enhancedMetrics?.qualityIndex?.toFixed(1) || 'N/A'}/5`, 50, 725);
    }
    
    // Footer
    doc.fontSize(10).font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleString()}`, 50, 750)
       .text('Report generated by TMM Location Evaluation System', 50, 770);
  }

  /**
   * 📧 Send email report
   */
  async sendEmailReport(location, pdfPath) {
    try {
      const mailOptions = {
        from: '"TMM Location Reports" <tmm.reports.temp@gmail.com>',
        to: CONFIG.EMAIL_RECIPIENT,
        subject: `🍥 Location Evaluation Report - ${location.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">🍥 The Momos Mafia - Location Report</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">📍 Client Information</h3>
              <p><strong>Client Name:</strong> ${location.clientName}</p>
              <p><strong>Address:</strong> ${location.address}</p>
              <p><strong>State:</strong> ${location.state}</p>
              <p><strong>Status:</strong> ${location.status}</p>
              <p><strong>Business Type:</strong> ${location.vegNonVeg}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">📊 Performance Summary</h3>
              <p><strong>Total Sales:</strong> ₹${location.totalSale || 'N/A'}</p>
              <p><strong>Revenue per Day:</strong> ₹${location.revPerDay || 'N/A'}</p>
              <p><strong>Ranking:</strong> ${location.ranking || 'N/A'}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">🗺️ Location Details</h3>
              <p><strong>Coordinates:</strong> ${location.lat}, ${location.lng}</p>
              <p><strong>Google Listing:</strong> ${location.googleListing}</p>
            </div>
            
            <p style="margin-top: 30px;">
              📎 Please find the detailed location evaluation report attached as a PDF.
            </p>
            
            <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
              This report was automatically generated by the TMM Location Evaluation System.<br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        attachments: [
          {
            filename: path.basename(pdfPath),
            path: pdfPath,
            contentType: 'application/pdf'
          }
        ]
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent for ${location.clientName}`);
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
      
    } catch (error) {
      console.error(`❌ Email sending failed for ${location.clientName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📧 Send summary email
   */
  async sendSummaryEmail() {
    try {
      const mailOptions = {
        from: '"TMM Location Reports" <tmm.reports.temp@gmail.com>',
        to: CONFIG.EMAIL_RECIPIENT,
        subject: `🍥 Batch Location Analysis Summary - ${this.processedCount} Reports Generated`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">🍥 The Momos Mafia - Batch Analysis Summary</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">📊 Processing Summary</h3>
              <p><strong>Total Locations Processed:</strong> ${this.processedCount}</p>
              <p><strong>Failed Locations:</strong> ${this.failedCount}</p>
              <p><strong>Success Rate:</strong> ${((this.processedCount / (this.processedCount + this.failedCount)) * 100).toFixed(1)}%</p>
              <p><strong>Completion Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">✅ Successfully Processed Locations</h3>
              ${this.results.filter(r => r.success).map(result => `
                <p style="margin: 5px 0;">📍 ${result.clientName} - ${result.address}</p>
              `).join('')}
            </div>
            
            ${this.failedCount > 0 ? `
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #721c24; margin-top: 0;">❌ Failed Locations</h3>
              ${this.results.filter(r => !r.success).map(result => `
                <p style="margin: 5px 0;">📍 ${result.clientName} - ${result.error}</p>
              `).join('')}
            </div>
            ` : ''}
            
            <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
              All individual location reports have been sent as separate emails.<br>
              Reports are also saved in: ${CONFIG.REPORTS_FOLDER}
            </p>
          </div>
        `
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Summary email sent`);
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      
    } catch (error) {
      console.error('❌ Summary email sending failed:', error);
    }
  }

  /**
   * 🔧 Utility functions
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  processBatchResults(results) {
    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error('❌ Batch item failed:', result.reason?.message || result.reason);
      }
    });
  }
}

// Main execution
if (require.main === module) {
  const processor = new BatchLocationProcessor();
  processor.process().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = BatchLocationProcessor;

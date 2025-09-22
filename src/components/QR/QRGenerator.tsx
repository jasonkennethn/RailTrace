import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Download, Package, Shield, QrCode, Copy, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { blockchainService } from '../../services/blockchainService';

interface QRData {
  id: string;
  dataUrl: string;
  qrCode: string;
}

interface QRGeneratorProps {
  onGenerate?: (qrData: QRData) => void;
}

export function QRGenerator({ onGenerate }: QRGeneratorProps) {
  const [formData, setFormData] = useState({
    batchNumber: '',
    fittingType: 'clip',
    quantity: '',
    material: '',
    specifications: '',
    vendorId: 'VENDOR-001' // This would come from auth context
  });
  
  const [generatedQRs, setGeneratedQRs] = useState<Array<{
    id: string;
    qrCode: string;
    dataUrl: string;
    timestamp: Date;
  }>>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const registerBatchOnChain = async () => {
    if (generatedQRs.length === 0) return;
    setIsRegistering(true);
    setRegistrationStatus('idle');
    
    try {
      for (const item of generatedQRs) {
        const registration = {
          partId: item.id,
          vendorId: formData.vendorId,
          lotId: formData.batchNumber,
          manufactureDate: new Date(),
          specifications: {
            material: formData.material,
            details: formData.specifications
          }
        };
        
        await blockchainService.registerPart(registration);
      }
      setRegistrationStatus('success');
    } catch (error) {
      console.error('Registration failed:', error);
      setRegistrationStatus('error');
    } finally {
      setIsRegistering(false);
    }
  };

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1773cf',
          light: '#ffffff'
        }
      });
      return dataUrl;
    } catch (error) {
      console.error('QR generation failed:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!formData.batchNumber || !formData.quantity) return;
    
    setIsGenerating(true);
    const quantity = parseInt(formData.quantity);
    const newQRs: Array<{
      id: string;
      qrCode: string;
      dataUrl: string;
      timestamp: Date;
    }> = [];

    try {
      for (let i = 0; i < quantity; i++) {
        const partId = `${formData.batchNumber}-${String(i + 1).padStart(3, '0')}`;
        const qrData = JSON.stringify({
          partId,
          batchNumber: formData.batchNumber,
          fittingType: formData.fittingType,
          vendorId: formData.vendorId,
          material: formData.material,
          specifications: formData.specifications,
          timestamp: new Date().toISOString()
        });

        const dataUrl = await generateQRCode(qrData);
        
        newQRs.push({
          id: partId,
          qrCode: qrData,
          dataUrl,
          timestamp: new Date()
        });
      }

      setGeneratedQRs(prev => [...prev, ...newQRs]);
      
      if (onGenerate && newQRs.length > 0) {
        onGenerate(newQRs[0]);
      }
    } catch (error) {
      console.error('QR generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (qr: { id: string; dataUrl: string }) => {
    const link = document.createElement('a');
    link.download = `qr-${qr.id}.png`;
    link.href = qr.dataUrl;
    link.click();
  };

  const downloadAllQRs = () => {
    generatedQRs.forEach((qr, index) => {
      setTimeout(() => downloadQR(qr), index * 100);
    });
  };

  const copyQRData = (qr: { qrCode: string }) => {
    navigator.clipboard.writeText(qr.qrCode);
  };

  const clearGenerated = () => {
    setGeneratedQRs([]);
    setRegistrationStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark font-display mb-2">
          QR Code Generator
        </h1>
        <p className="text-subtle-light dark:text-subtle-dark">
          Generate QR codes for railway fittings and register them on the blockchain
        </p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader title="Generate QR Codes" subtitle="Enter batch details to generate QR codes">
          <Badge variant="info" size="sm">
            <QrCode className="h-3 w-3 mr-1" />
            Batch Generation
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Batch Number *
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Fitting Type
                </label>
                <select
                  value={formData.fittingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, fittingType: e.target.value }))}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="clip">Rail Clip</option>
                  <option value="bolt">Rail Bolt</option>
                  <option value="plate">Rail Plate</option>
                  <option value="sleeper">Concrete Sleeper</option>
                  <option value="bearing">Bearing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Number of QR codes to generate"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Steel, Iron, Concrete"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Specifications
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent h-20 resize-none"
                  placeholder="Additional specifications or notes"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.batchNumber || !formData.quantity || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Codes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated QR Codes */}
      {generatedQRs.length > 0 && (
        <Card>
          <CardHeader 
            title="Generated QR Codes" 
            subtitle={`${generatedQRs.length} QR codes generated`}
          >
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadAllQRs}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" size="sm" onClick={clearGenerated}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedQRs.map((qr) => (
                <div
                  key={qr.id}
                  className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-4"
                >
                  <div className="text-center">
                    <div className="mb-3">
                      <img
                        src={qr.dataUrl}
                        alt={`QR Code for ${qr.id}`}
                        className="mx-auto border border-border-light dark:border-border-dark rounded-lg"
                      />
                    </div>
                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                      {qr.id}
                    </h4>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-3">
                      Generated: {qr.timestamp.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQR(qr)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyQRData(qr)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Registration */}
      {generatedQRs.length > 0 && (
        <Card>
          <CardHeader 
            title="Blockchain Registration" 
            subtitle="Register generated QR codes on the blockchain"
          >
            <Badge variant="primary" size="sm">
              <Shield className="h-3 w-3 mr-1" />
              Secure Registration
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                    Registration Status
                  </span>
                  {registrationStatus === 'success' && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Registered
                    </Badge>
                  )}
                  {registrationStatus === 'error' && (
                    <Badge variant="error" size="sm">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                  {registrationStatus === 'idle' && (
                    <Badge variant="default" size="sm">
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {generatedQRs.length} QR codes ready for blockchain registration
                </p>
              </div>

              <Button
                onClick={registerBatchOnChain}
                disabled={isRegistering || registrationStatus === 'success'}
                className="w-full"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Registering on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Register on Blockchain
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
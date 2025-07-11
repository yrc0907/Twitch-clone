"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Copy, Eye, EyeOff, AlertTriangle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KeysPage() {
  const [showKey, setShowKey] = useState(false);
  const [serverUrl, setServerUrl] = useState("rtmp://stream.example.com/live");
  const [streamKey, setStreamKey] = useState("your-secret-stream-key-12345");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ingressType, setIngressType] = useState<string>("");

  const copyToClipboard = (text: string, itemName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${itemName} 已复制到剪贴板`);
      })
      .catch((err) => {
        toast.error(`复制失败: ${err}`);
      });
  };

  const handleGenerate = () => {
    setIsDialogOpen(false);
    // 这里可以实现生成新的连接信息的逻辑
    const newKey = `new-stream-key-${Math.random().toString(36).substring(2, 10)}`;
    setStreamKey(newKey);
    toast.success("已生成新的连接信息");
  };

  return (
    <>
      <div className={`h-full p-6 ${isDialogOpen ? "blur-sm" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Keys & URLs</h1>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsDialogOpen(true)}
          >
            Generate
          </Button>
        </div>

        <div className="space-y-6">
          {/* Server URL Field */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <div className="mb-2 text-xl font-medium">Server URL</div>
            <div className="flex items-center">
              <Input
                className="bg-gray-800 border-gray-700 text-white"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
              />
              <Button
                variant="ghost"
                className="ml-2"
                size="icon"
                onClick={() => copyToClipboard(serverUrl, "服务器URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stream Key Field */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <div className="mb-2 text-xl font-medium">Stream Key</div>
            <div>
              <div className="flex items-center">
                <Input
                  className="bg-gray-800 border-gray-700 text-white"
                  type={showKey ? "text" : "password"}
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="ml-2"
                  size="icon"
                  onClick={() => copyToClipboard(streamKey, "串流密钥")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="ml-2"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-white">Generate connection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={ingressType} onValueChange={setIngressType}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                <div className="flex justify-between items-center w-full">
                  <SelectValue placeholder="Ingress Type" />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="rtmp">RTMP</SelectItem>
                <SelectItem value="whip">WHIP</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-6 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                This action will reset all active streams using the current connection
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700 text-white hover:bg-gray-800">
              Cancel
            </Button>
            <Button variant="default" onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700">
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback defaults from src/lib/supabase-config.ts
const SUPABASE_DEFAULTS = {
  url: 'https://wwywagceysyyadcuqtux.supabase.co', 
  publishableKey: 'sb_publishable_OqQxU-vOjRqpd_Rv1HskmA_X4r44M_3',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || SUPABASE_DEFAULTS.url;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY ||
                    SUPABASE_DEFAULTS.publishableKey;

const supabase = createClient(supabaseUrl, supabaseKey);

// Cache settings: 5 minutes TTL, check period 1 minute
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

async function fetchBootstrapData() {
  const [categoriesRes, itemsRes, brandRes, ordersRes, waiterCallsRes] = await Promise.all([
    supabase.from('categories').select('id,name,icon,sort_order').order('sort_order', { ascending: true }),
    supabase.from('menu_items').select('id,name,description,price,category_id,image_url,available,preparation_time').order('created_at', { ascending: true }),
    supabase.from('brand_settings').select('*').limit(1).single(),
    supabase.from('orders').select('*, order_items(quantity, notes, unit_price, menu_items(*))').order('created_at', { ascending: false }).limit(50),
    supabase.from('waiter_calls').select('*').order('created_at', { ascending: false }).limit(50)
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (itemsRes.error) throw itemsRes.error;
  
  const categories = categoriesRes.data || [];
  const items = itemsRes.data || [];
  const brand = brandRes.data || null;
  const orders = (ordersRes.data || []).map((o: any) => ({
    ...o,
    order_items: o.order_items || []
  }));
  const waiter_calls = waiterCallsRes.data || [];

  return { categories, items, brand, orders, waiter_calls };
}

export const app = express();

async function startServer() {
  const PORT = 3000;
  const rootPath = process.cwd();

  app.use(express.json());

  // API Routes
  app.get("/api/bootstrap", async (req, res) => {
    try {
      const cachedData = cache.get("bootstrap");
      if (cachedData) {
        return res.json(cachedData);
      }

      console.log("Fetching bootstrap data from Supabase...");
      const data = await fetchBootstrapData();
      cache.set("bootstrap", data);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching bootstrap data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Manual cache invalidation
  app.post("/api/cache/invalidate", (req, res) => {
    cache.del("bootstrap");
    res.json({ status: "ok", message: "Cache invalidated" });
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(rootPath, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(rootPath, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening if not being imported (e.g. by Vercel)
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION;
  const isStandalone = !isVercel;

  if (isStandalone) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

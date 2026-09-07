import urllib.request
import json
import concurrent.futures
import time

symbols = [
  'LEC', 'CHCL', 'NABIL', 'NICA', 'UPPER', 'SHIVM', 'HDL', 'CIT', 'HIDCL', 
  'AHPC', 'GBIME', 'NTC', 'HRL', 'SONA', 'SCB', 'EBL', 'GBBL', 'MNBBL', 
  'CFCL', 'MFIL', 'CBBL', 'SKBBL', 'NLIC', 'SALICO', 'SHL', 'STC', 'NIBLPF'
]

def fetch_symbol(sym):
    url = f'https://sharebazaar.vercel.app/api/zaan?action=getStockDividendHistory&symbol={sym}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            res_text = response.read().decode('utf-8')
            data = json.loads(res_text)
            table = data.get('data', {}).get('table', [])
            div_list = table[0].get('data', []) if table else []
            ltp = data.get('ltp', 0)
            latest = div_list[0] if div_list else None
            return {
                'symbol': sym,
                'success': True,
                'ltp': ltp,
                'ticker_name': data.get('ticker_name', sym),
                'latest': latest,
                'history': div_list
            }
    except Exception as e:
        return {
            'symbol': sym,
            'success': False,
            'error': str(e),
            'ltp': 0,
            'latest': None,
            'history': []
        }

print('Starting concurrent fetch from ShareBazaar Community API...')
results = {}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
    futures = {executor.submit(fetch_symbol, sym): sym for sym in symbols}
    for future in concurrent.futures.as_completed(futures):
        sym = futures[future]
        try:
            res = future.result()
            results[sym] = res
            if res['success'] and res['latest']:
                latest = res['latest']
                print(f"[OK] {sym}: FY={latest.get('fiscal_year')}, Cash={latest.get('cash')}%, Bonus={latest.get('bonus')}%, BookClose={latest.get('bookclose')}, Records={len(res['history'])}", flush=True)
            elif res['success']:
                print(f"[NO_DIVIDEND_RECORD] {sym}: No dividend history in ShareBazaar", flush=True)
            else:
                print(f"[ERR] {sym}: {res.get('error')}", flush=True)
        except Exception as e:
            print(f"[EXC] {sym}: {e}", flush=True)

with open('src/data/sharebazaarDividends.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f'Done! Successfully saved {len(results)} stocks to src/data/sharebazaarDividends.json', flush=True)

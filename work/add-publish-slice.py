from pathlib import Path
p=Path('outputs/ddd-coach-plan.html')
s=p.read_text()
start=s.index('const slices=[')
end=s.index('\n];', start)
block=s[start:end]
count=0
lines=[]
for line in block.splitlines():
    if line.startswith('{title:'):
        count+=1
        line=line.replace('{title:', f"{{id:'{count}',stage:{count},title:", 1)
    lines.append(line)
    if count==2 and line.startswith('{id:'):
        lines.append("{id:'2a',stage:2,title:'Publish a working preview',phase:'Deployment',change:'Publish the slice 2 app to Sites or your Netlify, including its server-side OpenRouter endpoint. Choose the target when implementing this slice; configure OPENROUTER_API_KEY and OPENROUTER_MODEL in the hosting environment.',check:'Open the deployed URL in a fresh browser session. Send two related messages and verify a real reply retains the first-turn context. Confirm failure/retry behavior and that the provider key is not delivered to the browser.',exclude:'One working hosted URL. No custom domain, accounts, persistence, or deployment to both providers. Local .env stays out of the published bundle.'},")
s=s[:start]+'\n'.join(lines)+s[end:]
s=s.replace('Thirteen slices · focus on slice 1','14 slices · deployment after slice 2')
s=s.replace('button.textContent=index+1', 'button.textContent=slice.id')
s=s.replace('`Slice ${index+1}: ${slice.title}`', '`Slice ${slice.id}: ${slice.title}`')
s=s.replace('String(state.slice+1).padStart(2,\'0\')', 'slice.id.padStart(2,\'0\')')
s=s.replace('${state.slice+1}: ${slice.title}', '${slice.id}: ${slice.title}')
s=s.replace('state.slice<2?', 'slice.stage<=2?')
s=s.replace('state.slice<11?', 'slice.stage<12?')
s=s.replace('state.slice>=6&&state.slice<11', 'slice.stage>=7&&slice.stage<12')
s=s.replace('state.slice>=3)', 'slice.stage>=4)')
s=s.replace('Each product slice adds one observable behavior.', 'Slice 2a publishes a working preview to Sites or your Netlify. Existing slice numbers stay stable. Each product slice adds one observable behavior.')
s=s.replace("if(state.notes.trim())parts.push", "parts.push('After slice 2, complete slice 2a: publish the working app and server-side OpenRouter endpoint to Sites or the user’s Netlify. Configure OPENROUTER_API_KEY and OPENROUTER_MODEL as hosted environment values, exclude local .env, and verify a two-turn conversation plus failure/retry at the deployed URL. Choose the target during implementation. Keep the board at slice 4 and sensors at slice 5.');\n if(state.notes.trim())parts.push",1)
s=s.replace('Draft 07', 'Draft 08')
p.write_text(s)
p=Path('outputs/ddd-coach-backlog.md')
s=p.read_text().replace('separate from the 13 planned slices', 'separate from the 14 planned slices (1, 2, 2a, then 3–13)')
s=s.replace('## Confirmed product direction', '## Confirmed deployment milestone\n\nSlice **2a**, immediately after slice 2: publish a working preview to **Sites or the user’s Netlify**. Target is chosen during implementation. Include the server-side OpenRouter endpoint and hosted environment configuration; verify a real two-turn exchange and failure/retry at the resulting URL. Existing board and sensor slice numbers remain 4 and 5.\n\n## Confirmed product direction')
p.write_text(s)
p=Path('outputs/generative-coach-direction.md')
s=p.read_text().replace('- Preserve slices 1–3 as the smallest connection, continuity, and coaching groundwork.', '- Preserve slices 1–3 as the smallest connection, continuity, and coaching groundwork.\n- Insert slice 2a after slice 2: publish a working preview to Sites or the user’s Netlify, including the server-side OpenRouter route and hosted environment values.')
p.write_text(s)

function pub_format_inp(st1) 
{
    // console.log(st1);
        const positions = [];
        for (let i=0;i<st1.length;i++)
        {
            // console.log(st1[i]);
            if (st1[i]=== '=')
            {
                positions.push(i);
            }
        }
        // console.log(positions);
        const positions_2 =[];
        for (let i=1;i<positions.length;i++)
        {
            for (let j=positions[i];j>positions[i-1];j-- )
            {
                if (st1[j]===',')
                {
                    positions_2.push(j);
                    break;
                }
            }
        }
        positions_2.push(st1.length);
        // console.log(positions_2);
        var sta2 =[];
        for (let i=0;i<positions.length;i++)
        {
            let stre = "";
            for (let j=positions[i]+1;j<positions_2[i];j++)
            {
                stre+=st1[j];
            }
            stre = stre.trim();
            // console.log(stre);
            var siz1 = stre.length;
            //var sta1 =[], sta2=[];
            var sta1 = [];
            var stre_2 = "";
            for (let j=0;j<siz1;j++)
            {
                
                const to_ad = stre[j];
                // if (to_ad in ['"','[',']'])
                if (to_ad === '[')
                {
                    sta1.push(to_ad);
                }
                else if (to_ad ===']')
                {
                    sta1.pop();
                    if (stre_2.length>0)
                    {sta2.push(stre_2);}
                    stre_2="";
                }
                else
                {
                    stre_2 += to_ad;
                }
            }
            // console.log(stre_2);
            if (stre_2.length>0)
            {
                sta2.push(stre_2);
                // console.log(stre_2);
            }
        }
            // sta2 is 
            var fina = " ";
            for (let j=0;j<sta2.length;j++)
            {
                stre_2 = sta2[j];
                for (let k=0;k<stre_2.length;k++)
                {
                    if (stre_2[k]!=='"')
                    {
                        if (stre_2[k]!==',')
                        {
                            fina+=stre_2[k];
                        }
                        else
                        {
                            fina+=' ';
                        }
                    }
                }
                fina+="\n";
            }
        
        
        return fina;
}

function pub_format_opt(stre)
{
            stre = stre.trim();
            var siz1 = stre.length;
            var sta1 =[], sta2=[];
            var stre_2 = "";
            for (let j=0;j<siz1;j++)
            {
                
                const to_ad = stre[j];
                // if (to_ad in ['"','[',']'])
                if (to_ad === '[')
                {
                    sta1.push(to_ad);
                }
                else if (to_ad ===']')
                {
                    sta1.pop();
                    if (stre_2.length>0)
                    {sta2.push(stre_2);}
                    stre_2="";
                }
                else
                {
                    stre_2 += to_ad;
                }
            }
            if (stre_2.length>0)
            {
                sta2.push(stre_2);
            }
            // sta2 is 
            var fina = " ";
            for (let j=0;j<sta2.length;j++)
            {
                stre_2 = sta2[j];
                for (let k=0;k<stre_2.length;k++)
                {
                    if (stre_2[k]!=='"')
                    {
                        if (stre_2[k]!==',')
                        {
                            fina+=stre_2[k];
                        }
                        else
                        {
                            fina+=' ';
                        }
                    }
                }
                fina+="\n";
            }
        return fina;
}

module.exports = { pub_format_inp, pub_format_opt };
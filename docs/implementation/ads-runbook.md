# AdSense setup và release boundary

User đã cho phép setup và chỉ định tài khoản nhận doanh thu trong cuộc trò chuyện. Đã xác thực publisher ca-pub-5281756390120867, tài khoản hiện có AdMob. Đã hoàn tất bước thêmAdSense theo hướng dẫnGoogle; Ads/Sites/Privacy&messaging xuất hiện. Displayunit9611937108 đãđượcGoogle xácnhậntạo. Siteapproval chưa có; không lưu authURL/credential hoặc thôngtinpayments trongrepo.

## Đã có trong source

- ads-policy configstrict, exactarticleallowlist, chặnquery/session; siteapproval/enabled flags mặc địnhfalse.
- `/ads.txt` trả404 khi publisherID vắng/sai; trảrecordGoogleDIRECT khi ownerID hợp lệ. Không nhúng placeholder vào sitepublic.
- Một adslot sau nộidung chính bài viết, nhãnQuảngcáo khi filled; không overlay canvas hoặc giả làm nguồn ykhoa. Anonymousonly đến khi paid entitlementready; tấtcả người đăng nhập hiện không tảiadscript.
- Loader nonced chỉ sauexplicitTCFconsent từCMP đã cấu hình; yêu cầu consent1/2/7/9/10 vàGooglevendor755, stricterthan legitimateinterest defaults. Unknown/noCMP/denial =>0adload. Google xử lýTCstringthêm theo policy. Đây không phải bộCMPtựviết và không tự tạo bằng chứngconsent.
- Native links trên article cóad để thirdpartySDK không sống tiếp qua softnavigation tới privateroute. Libraryarticlelinks full-document đểnoncekhớp. CSPadresources chỉ trênexactallowlistanon/noquery; private/global policygiữ chặt.

## Thiết lập khi đăng nhập xong

1. Kiểm tra đã cóAdSense, tránh tạoaccounttrùng. Owner xác nhậnpaymentscountry/payee/terms chính xác nếu cần. Không tựđiền hoặc suy ra thông tintax/bank.
2. Chọn domainproduction owner sở hữu, thêmSites; dùngads.txt để xác minh tránhchèn globaladcode chỉ để verify. Chưa códomain thì chưaaddsitegiả.
3. Hoàn tất siteapproval theoGoogle. Không yêu cầu duyệt trangempty/conceptnhư sản phẩmđãcónộidung.
4. TạoDisplayresponsiveunit có tên rõ bài viết, lấypublisherID/slotID thật. Không bậtAutoAds toànsite.
5. Thiết lập Google-certifiedCMP vàprivacychoices theo vùng; cấu hìnhCMP chạytrướcloader trênarticle, cócáchđổi/rútconsent. **CMP script/integration hiện chưa cài** vì chưa cóprovider/accountconfig. Không bậtADSENSE_ENABLED trước khiCMP đượckiểm thử.
6. Điền serverenvironment ADSENSE_PUBLISHER_ID, ARTICLE_SLOT_ID, CERTIFIED_CMP_ID; chọnarticleSLUGS đãreviewad-suitability. Bệnh lýnhạycảm/private/quiz/canvas không vàoallowlist. SiteapprovedflagchỉtruekhiGoogleđãduyệt.
7. Kiểm thửconsentgrant/deny/revoke, CSP, SDK/creative, nofill/error, navigation, accountpaid, mobileCLS trongprovider-supportedtestmode; không clickrealads. Global CSPkhôngđược nới wildcard/unsafeeval chỉ đểcreative chạy. CSPrestrictive hiện tại cóthể chặncreative; đây là **live compatibility NOT_TESTED**, cần giải quyết với evidence cụthể.
8. Chỉenablekhiaccount/domain/content/CMP/livechecks đềuđạt. NếuCMP/appad lỗi: switchfalse+restart, đóngadslot. Thayenvkhônggiếtcode đãloadedtrêntabđangmở; cầnreload/expiry chiếnlượcrollout rõràng.

## Giới hạn chưa hoàn thành

Accountonboarding vàpublisher/adslot thật cóevidence trongadsense-setup.json vàảnhadsense-ad-created.png. Domainverification, policyapproval, CMPbootstrap/privacychoices, filled-adview, adrequestprivacy/networkaudit vàrevenue chưa cóevidence. Codekhôngđồng nghĩa quảngcáođangkiếmtiền. Provider script được phépchạy cóquyềnthirdpartytrênarticle; khôngđượcgắn vớidữliệunhạycảm.

Nguồn: [GoogleCMPrequirements](https://support.google.com/adsense/answer/13554020), [TCFintegration](https://support.google.com/adsense/answer/9804260), [CSP](https://support.google.com/adsense/answer/16283098), [ads.txt](https://support.google.com/adsense/answer/12171612). Đọc2026-09-30. Không coi nútbooleanapprovedtrongenv là evidenceGoogleapproval.

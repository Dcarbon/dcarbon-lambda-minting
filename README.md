## Environment
Node version: v18.12.0
## Git Flow
__[Git branch]__ {type}({service})/{issue_code}-noi-dung-branch.

__[Git commit]__ {type}({service}): {issue_code} noi dung commit.

- __type:__ feat | fix | hotfix | docs | style | refactor | perf | test | build | ci | chore | BREAKING_CHANGE
- __service:__ storefront | admin | infra | custom-module | product | customer | order | delivery | search | bff | bff-admin
- __issue_code:__ KYUPAD | NO_ISSUE

[__Sample__]
- __Git commit:__
feat(storefront): KYUPAD1-2 test commit
- __Git branch:__
feat(storefront)/KYUPAD1-2-test-branch"

[__Commit type note:__]
- __feat:__ Những thay đổi cho tính năng mới.
- __fix:__ Những thay đổi liên quan đến sửa lỗi trong ứng dụng, hệ thống.
- __docs:__ Những thay đổi liên quan đến sửa đổi document trong repo.
- __style:__ Những thay đổi không làm thay đổi ý nghĩa của code như căn hàng, xuồng dòng ở cuối file…
- __refactor:__ Tối ưu source code, có thể liên quan logic…Ví dụ như xoá code thừa, tối giản code, đổi tên biến …
- __perf:__ Thay đổi giúp tăng hiệu năng.
- __test:__ Thêm hoặc sửa các testcase trong hệ thống.
- __build:__ Thay đổi liên quan đến hệ thống hoặc các thư viên bên ngoài (Ảnh hưởng đến tiến trình build)
- __ci:__ Thay đổi liên quan đến cấu hình CI…
- __chore:__ Những sửa đổi nhỏ nhặt không liên quan tới code.
- __BREAKING_CHANGE:__ Nhưng commit mới footer là BREAKING CHANGE thể hiện những thay đổi gây ảnh hướng lớn đến source code ví dụ thay đổi kiểu dữ liệu, cách lấy dữ liệu
